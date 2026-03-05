import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import {
  ConfigStore,
  HardwareService,
  LiveOscAdapter,
  LiveSerialAdapter,
  RotatingJsonLogger,
  SimulatedOscAdapter,
  SimulatedSerialAdapter
} from "@paf/core";
import {
  commandPayloadSchema,
  stateLanguagePayloadSchema,
  type CommandEnvelope,
  type CommandId,
  type RuntimeConfig
} from "@paf/protocols";
import type { WebSocket } from "ws";

export interface BuildAppOptions {
  configPath?: string;
  logsPath?: string;
  hardwareMode?: "simulated" | "live";
}

export async function buildApp(options: BuildAppOptions = {}) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const appRoot = resolve(__dirname, "../..");

  const configPath = options.configPath ?? process.env.PAF_CONFIG_PATH ?? resolve(appRoot, "data/config.json");
  const logsPath = options.logsPath ?? process.env.PAF_LOG_DIR ?? resolve(appRoot, "logs");
  const hardwareMode =
    options.hardwareMode ?? (process.env.PAF_HARDWARE_MODE === "live" ? "live" : "simulated");

  const configStore = new ConfigStore(configPath);
  const logger = new RotatingJsonLogger(logsPath, 5 * 1024 * 1024);
  const serial = hardwareMode === "live" ? new LiveSerialAdapter() : new SimulatedSerialAdapter();
  const osc = hardwareMode === "live" ? new LiveOscAdapter() : new SimulatedOscAdapter();
  const hardwareService = new HardwareService(hardwareMode, osc, serial, logger);

  const fastify = Fastify({ logger: false });
  await fastify.register(cors, { origin: true });
  await fastify.register(websocket);

  let runtimeConfig: RuntimeConfig = await configStore.load();
  const sockets = new Set<WebSocket>();

  function broadcast(event: string, payload: Record<string, unknown>): void {
    const data = JSON.stringify({ event, payload, ts: Date.now() });
    for (const socket of sockets) {
      if (socket.readyState === 1) {
        socket.send(data);
      }
    }
  }

  async function persistAndBroadcastState(): Promise<void> {
    runtimeConfig.state.updatedAt = Date.now();
    await configStore.save(runtimeConfig);
    broadcast("state.updated", { state: runtimeConfig.state, health: hardwareService.getHealth() });
  }

  async function dispatch(commandId: CommandId, source: CommandEnvelope["source"]): Promise<void> {
    const envelope: CommandEnvelope = { commandId, source, timestamp: Date.now() };
    await hardwareService.dispatchCommand(envelope, runtimeConfig, runtimeConfig.state);
    runtimeConfig.state.activeLang = commandId.endsWith("Pt") ? "port" : "eng";
    runtimeConfig.state.activeDeck =
      commandId.startsWith("pedro") ? "pedro" : commandId.startsWith("linha") ? "timeline" : "multi";
    await persistAndBroadcastState();
    broadcast("command.sent", { commandId, source, state: runtimeConfig.state });
    broadcast("hardware.status", { health: hardwareService.getHealth() });
  }

  fastify.get("/health", async () => {
    return {
      status: "ok",
      hardwareMode,
      health: hardwareService.getHealth()
    };
  });

  fastify.get("/api/v1/state", async () => {
    return {
      state: runtimeConfig.state,
      health: hardwareService.getHealth()
    };
  });

  fastify.patch("/api/v1/state/language", async (request, reply) => {
    const parsed = stateLanguagePayloadSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Payload invalido", details: parsed.error.issues });
    }

    runtimeConfig.state.activeLang = parsed.data.activeLang;
    await persistAndBroadcastState();
    return { state: runtimeConfig.state };
  });

  fastify.post("/api/v1/state/toggle-lock", async () => {
    runtimeConfig.state.locked = !runtimeConfig.state.locked;
    await persistAndBroadcastState();
    return { state: runtimeConfig.state };
  });

  fastify.post("/api/v1/commands/send", async (request, reply) => {
    const parsed = commandPayloadSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Payload invalido", details: parsed.error.issues });
    }

    try {
      await dispatch(parsed.data.commandId, "ui");
      return { ok: true, commandId: parsed.data.commandId };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return reply.status(503).send({ ok: false, error: message });
    }
  });

  fastify.get("/ws", { websocket: true }, (socket) => {
    sockets.add(socket as WebSocket);
    socket.send(
      JSON.stringify({
        event: "state.updated",
        payload: { state: runtimeConfig.state, health: hardwareService.getHealth() },
        ts: Date.now()
      })
    );

    socket.on("close", () => {
      sockets.delete(socket as WebSocket);
    });
  });

  await hardwareService.start(async (commandId) => {
    await dispatch(commandId, "hardware");
  });

  return fastify;
}

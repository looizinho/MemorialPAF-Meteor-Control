import type {
  CommandEnvelope,
  CommandId,
  HardwareHealth,
  RuntimeConfig,
  SystemState
} from "@paf/protocols";
import { resolveCommand } from "./command-router";
import type { RotatingJsonLogger } from "./logger";
import type { OscAdapter } from "./osc-adapter";
import type { SerialAdapter } from "./serial-adapter";

export class HardwareService {
  private health: HardwareHealth;

  constructor(
    private readonly mode: "simulated" | "live",
    private readonly osc: OscAdapter,
    private readonly serial: SerialAdapter,
    private readonly logger: RotatingJsonLogger
  ) {
    this.health = {
      mode,
      osc: "connected",
      serial: "connected",
      updatedAt: Date.now()
    };
  }

  getHealth(): HardwareHealth {
    return this.health;
  }

  async start(onHardwareCommand: (commandId: CommandId) => Promise<void>): Promise<void> {
    this.serial.on("hardware.command", async (commandId: CommandId) => {
      await onHardwareCommand(commandId);
    });

    await this.serial.start();
    await this.logger.write({ level: "info", event: "hardware.started", payload: { mode: this.mode } });
  }

  async dispatchCommand(
    envelope: CommandEnvelope,
    config: RuntimeConfig,
    state: SystemState
  ): Promise<{ ok: true }> {
    if (state.locked) {
      throw new Error("Sistema bloqueado. Desbloqueie antes de enviar comandos.");
    }

    const resolved = resolveCommand(envelope, config);

    try {
      if (resolved.controllerMessage && resolved.deck.controller.enabled) {
        await this.osc.send(resolved.deck.controller.address, resolved.deck.controller.port, [resolved.controllerMessage]);
      }

      if (resolved.deck.player.enabled) {
        await this.osc.send(resolved.deck.player.address, resolved.deck.player.port, resolved.playerMessages);
      }

      await this.logger.write({
        level: "info",
        event: "command.dispatched",
        payload: {
          commandId: envelope.commandId,
          deck: resolved.deckName,
          language: resolved.language,
          source: envelope.source
        }
      });

      this.health = {
        ...this.health,
        osc: "connected",
        updatedAt: Date.now(),
        lastError: undefined
      };

      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      this.health = {
        ...this.health,
        osc: "degraded",
        updatedAt: Date.now(),
        lastError: message
      };

      await this.logger.write({
        level: "error",
        event: "command.failed",
        payload: { commandId: envelope.commandId, error: message }
      });

      setTimeout(async () => {
        try {
          if (resolved.deck.player.enabled) {
            await this.osc.send(resolved.deck.player.address, resolved.deck.player.port, resolved.playerMessages);
          }
          await this.logger.write({
            level: "warn",
            event: "command.retry_success",
            payload: { commandId: envelope.commandId }
          });
        } catch {
          await this.logger.write({
            level: "error",
            event: "command.retry_failed",
            payload: { commandId: envelope.commandId }
          });
        }
      }, 600);

      throw error;
    }
  }
}

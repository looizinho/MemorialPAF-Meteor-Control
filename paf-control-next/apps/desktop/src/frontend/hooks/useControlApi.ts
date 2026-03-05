import { useEffect, useMemo, useState } from "react";
import type { CommandId, HardwareHealth, SystemState } from "@paf/protocols";

type UiStatus = "idle" | "sending" | "ok" | "error";

interface ApiState {
  state: SystemState | null;
  health: HardwareHealth | null;
  uiStatus: UiStatus;
  lastError: string | null;
  lastCommand: CommandId | null;
  sendCommand: (commandId: CommandId) => Promise<void>;
  toggleLock: () => Promise<void>;
  setLanguage: (lang: "port" | "eng") => Promise<void>;
}

const apiBase = "http://127.0.0.1:4317";

export function useControlApi(): ApiState {
  const [state, setState] = useState<SystemState | null>(null);
  const [health, setHealth] = useState<HardwareHealth | null>(null);
  const [uiStatus, setUiStatus] = useState<UiStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<CommandId | null>(null);

  async function refresh(): Promise<void> {
    const response = await fetch(`${apiBase}/api/v1/state`);
    const data = (await response.json()) as { state: SystemState; health: HardwareHealth };
    setState(data.state);
    setHealth(data.health);
  }

  useEffect(() => {
    void refresh();

    const ws = new WebSocket("ws://127.0.0.1:4317/ws");
    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data) as {
        event: "state.updated" | "command.sent" | "hardware.status";
        payload: { state?: SystemState; health?: HardwareHealth };
      };

      if (parsed.payload.state) {
        setState(parsed.payload.state);
      }

      if (parsed.payload.health) {
        setHealth(parsed.payload.health);
      }
    };

    return () => ws.close();
  }, []);

  async function sendCommand(commandId: CommandId): Promise<void> {
    setUiStatus("sending");
    setLastError(null);

    const response = await fetch(`${apiBase}/api/v1/commands/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commandId })
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setUiStatus("error");
      setLastError(payload.error ?? "Falha ao enviar comando");
      return;
    }

    setLastCommand(commandId);
    setUiStatus("ok");
  }

  async function toggleLock(): Promise<void> {
    await fetch(`${apiBase}/api/v1/state/toggle-lock`, { method: "POST" });
    await refresh();
  }

  async function setLanguage(lang: "port" | "eng"): Promise<void> {
    await fetch(`${apiBase}/api/v1/state/language`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeLang: lang })
    });
    await refresh();
  }

  return useMemo(
    () => ({
      state,
      health,
      uiStatus,
      lastError,
      lastCommand,
      sendCommand,
      toggleLock,
      setLanguage
    }),
    [health, lastCommand, lastError, state, uiStatus]
  );
}

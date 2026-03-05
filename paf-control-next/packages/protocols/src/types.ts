export type DeckName = "pedro" | "timeline" | "multi";
export type Language = "port" | "eng";

export type CommandId =
  | "pedroPt"
  | "pedroEn"
  | "linhaPt"
  | "linhaEn"
  | "multiPt"
  | "multiEn";

export interface OscMessage {
  msg: string;
  arg: number;
}

export interface DeckConfig {
  name: DeckName;
  title: string;
  player: {
    enabled: boolean;
    address: string;
    port: number;
    commands: Record<Language, OscMessage[]>;
  };
  controller: {
    enabled: boolean;
    address: string;
    port: number;
    message: string;
    arg: number;
  };
}

export interface CommandEnvelope {
  commandId: CommandId;
  source: "ui" | "hardware" | "system";
  timestamp: number;
}

export interface SystemState {
  version: number;
  idleMode: boolean;
  activeLang: Language;
  activeDeck: DeckName | "";
  locked: boolean;
  updatedAt: number;
}

export interface HardwareHealth {
  mode: "simulated" | "live";
  osc: "connected" | "degraded" | "disconnected";
  serial: "connected" | "degraded" | "disconnected";
  lastError?: string;
  updatedAt: number;
}

export interface RuntimeConfig {
  schemaVersion: number;
  state: SystemState;
  decks: DeckConfig[];
}

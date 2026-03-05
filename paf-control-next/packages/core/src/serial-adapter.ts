import { EventEmitter } from "node:events";
import type { CommandId } from "@paf/protocols";

export interface SerialAdapter extends EventEmitter {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export class SimulatedSerialAdapter extends EventEmitter implements SerialAdapter {
  async start(): Promise<void> {
    return;
  }

  async stop(): Promise<void> {
    return;
  }

  trigger(commandId: CommandId): void {
    this.emit("hardware.command", commandId);
  }
}

export class LiveSerialAdapter extends EventEmitter implements SerialAdapter {
  async start(): Promise<void> {
    const platform = process.platform;
    if (platform === "darwin") {
      return;
    }

    const serialport = await import("serialport");
    const firmataFactory = await import("firmata-io");

    const Firmata = (firmataFactory.default ?? firmataFactory) as any;
    const { SerialPort } = serialport;

    const SerialPortCompat = (path: string, options: any, openCallback: any) => {
      const serialOptions = { ...(options || {}), path, autoOpen: true };
      const port = new SerialPort(serialOptions);
      if (typeof openCallback === "function") {
        port.once("open", () => openCallback(null));
      }
      return port;
    };

    const Board = Firmata(SerialPortCompat);
    const boardLinha = new Board("/dev/ttyACM0");
    const boardPedro = new Board("/dev/ttyACM2");
    const boardMulti = new Board("/dev/ttyACM1");

    boardLinha.on("ready", () => {
      boardLinha.pinMode(2, boardLinha.MODES.PULLUP);
      boardLinha.digitalRead(2, () => this.emit("hardware.command", "linhaPt"));
    });

    boardPedro.on("ready", () => {
      boardPedro.pinMode(2, boardPedro.MODES.PULLUP);
      boardPedro.digitalRead(2, () => this.emit("hardware.command", "pedroPt"));
    });

    boardMulti.on("ready", () => {
      boardMulti.pinMode(2, boardMulti.MODES.PULLUP);
      boardMulti.digitalRead(2, () => this.emit("hardware.command", "multiPt"));
    });
  }

  async stop(): Promise<void> {
    return;
  }
}

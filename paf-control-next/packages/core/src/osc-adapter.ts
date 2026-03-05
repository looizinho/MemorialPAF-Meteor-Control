import type { OscMessage } from "@paf/protocols";

export interface OscAdapter {
  send(address: string, port: number, messages: OscMessage[]): Promise<void>;
}

export class SimulatedOscAdapter implements OscAdapter {
  async send(_address: string, _port: number, _messages: OscMessage[]): Promise<void> {
    return;
  }
}

export class LiveOscAdapter implements OscAdapter {
  private emitterPromise: Promise<any> | null = null;

  private async getEmitter(): Promise<any> {
    if (!this.emitterPromise) {
      this.emitterPromise = import("osc-emitter").then((mod) => {
        const OscEmitter = (mod.default ?? mod) as new () => {
          add: (address: string, port: number) => void;
          emit: (msg: string, arg: number) => void;
        };
        return new OscEmitter();
      });
    }

    return this.emitterPromise;
  }

  async send(address: string, port: number, messages: OscMessage[]): Promise<void> {
    const emitter = await this.getEmitter();
    emitter.add(address, port);
    for (const message of messages) {
      emitter.emit(message.msg, message.arg);
    }
  }
}

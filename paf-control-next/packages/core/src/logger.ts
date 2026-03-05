import { appendFile, mkdir, rename, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  event: string;
  payload?: Record<string, unknown>;
  timestamp: string;
}

export class RotatingJsonLogger {
  constructor(
    private readonly logDir: string,
    private readonly maxBytes = 5 * 1024 * 1024
  ) {}

  async write(entry: Omit<LogEntry, "timestamp">): Promise<void> {
    const now = new Date();
    const filename = `${now.toISOString().slice(0, 10)}.jsonl`;
    const filePath = join(this.logDir, filename);

    await mkdir(dirname(filePath), { recursive: true });
    await this.rotateIfNeeded(filePath);

    const record: LogEntry = { ...entry, timestamp: now.toISOString() };
    await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf-8");
  }

  private async rotateIfNeeded(filePath: string): Promise<void> {
    try {
      const current = await stat(filePath);
      if (current.size <= this.maxBytes) {
        return;
      }

      const rotated = `${filePath}.${Date.now()}.bak`;
      await rename(filePath, rotated);
    } catch {
      // File does not exist yet.
    }
  }
}

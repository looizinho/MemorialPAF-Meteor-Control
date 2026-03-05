import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { defaultRuntimeConfig, type RuntimeConfig } from "@paf/protocols";

export class ConfigStore {
  constructor(private readonly filePath: string) {}

  async load(): Promise<RuntimeConfig> {
    await mkdir(dirname(this.filePath), { recursive: true });

    try {
      const content = await readFile(this.filePath, "utf-8");
      return JSON.parse(content) as RuntimeConfig;
    } catch {
      await this.save(defaultRuntimeConfig);
      return structuredClone(defaultRuntimeConfig);
    }
  }

  async save(config: RuntimeConfig): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(config, null, 2), "utf-8");
  }
}

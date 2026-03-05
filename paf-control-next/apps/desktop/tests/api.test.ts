import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/backend/app";

let app: Awaited<ReturnType<typeof buildApp>>;

beforeAll(async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "paf-next-"));
  app = await buildApp({
    configPath: join(tempDir, "config.json"),
    logsPath: join(tempDir, "logs"),
    hardwareMode: "simulated"
  });
});

afterAll(async () => {
  await app.close();
});

describe("API v1", () => {
  it("retorna estado", async () => {
    const response = await app.inject({ method: "GET", url: "/api/v1/state" });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.state).toBeDefined();
  });

  it("altera idioma", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: "/api/v1/state/language",
      payload: { activeLang: "eng" }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().state.activeLang).toBe("eng");
  });

  it("envia comando valido", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/commands/send",
      payload: { commandId: "pedroPt" }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().ok).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { defaultRuntimeConfig } from "@paf/protocols";
import { resolveCommand } from "./command-router";

describe("resolveCommand", () => {
  it("resolve pedroPt para deck e idioma corretos", () => {
    const result = resolveCommand(
      { commandId: "pedroPt", source: "ui", timestamp: Date.now() },
      defaultRuntimeConfig
    );

    expect(result.deckName).toBe("pedro");
    expect(result.language).toBe("port");
    expect(result.playerMessages.length).toBeGreaterThan(0);
  });
});

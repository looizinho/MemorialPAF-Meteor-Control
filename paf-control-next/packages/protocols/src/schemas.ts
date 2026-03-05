import { z } from "zod";

export const languageSchema = z.enum(["port", "eng"]);
export const commandIdSchema = z.enum([
  "pedroPt",
  "pedroEn",
  "linhaPt",
  "linhaEn",
  "multiPt",
  "multiEn"
]);

export const commandPayloadSchema = z.object({
  commandId: commandIdSchema
});

export const stateLanguagePayloadSchema = z.object({
  activeLang: languageSchema
});

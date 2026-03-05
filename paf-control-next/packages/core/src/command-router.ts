import type {
  CommandEnvelope,
  CommandId,
  DeckConfig,
  DeckName,
  Language,
  OscMessage,
  RuntimeConfig
} from "@paf/protocols";

export interface ResolvedCommand {
  deck: DeckConfig;
  deckName: DeckName;
  language: Language;
  commandId: CommandId;
  playerMessages: OscMessage[];
  controllerMessage?: OscMessage;
}

const commandMap: Record<CommandId, { deck: DeckName; language: Language }> = {
  pedroPt: { deck: "pedro", language: "port" },
  pedroEn: { deck: "pedro", language: "eng" },
  linhaPt: { deck: "timeline", language: "port" },
  linhaEn: { deck: "timeline", language: "eng" },
  multiPt: { deck: "multi", language: "port" },
  multiEn: { deck: "multi", language: "eng" }
};

export function resolveCommand(
  envelope: CommandEnvelope,
  config: RuntimeConfig
): ResolvedCommand {
  const target = commandMap[envelope.commandId];
  const deck = config.decks.find((item) => item.name === target.deck);

  if (!deck) {
    throw new Error(`Deck nao encontrado para comando ${envelope.commandId}`);
  }

  return {
    deck,
    deckName: target.deck,
    language: target.language,
    commandId: envelope.commandId,
    playerMessages: deck.player.commands[target.language],
    controllerMessage: deck.controller.enabled
      ? { msg: deck.controller.message, arg: deck.controller.arg }
      : undefined
  };
}

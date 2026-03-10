import type { CommandId } from "@paf/protocols";

interface DeckCardProps {
  title: string;
  note?: string;
  primaryLabel: string;
  primaryCommand?: CommandId;
  secondaryLabel?: string;
  secondaryCommand?: CommandId;
  disabled?: boolean;
  onSend: (commandId: CommandId) => Promise<void>;
}

export function DeckCard({
  title,
  note,
  primaryLabel,
  primaryCommand,
  secondaryLabel,
  secondaryCommand,
  disabled = false,
  onSend
}: DeckCardProps) {
  const primaryDisabled = disabled || !primaryCommand;
  const secondaryDisabled = disabled || !secondaryCommand;

  return (
    <article className="deck-card" aria-label={title}>
      <header className="deck-card__header">
        <h2>{title}</h2>
        {note ? <p>{note}</p> : null}
      </header>

      <div className={`deck-card__actions ${secondaryLabel ? "deck-card__actions--dual" : "deck-card__actions--single"}`}>
        <button
          className="action-btn action-btn--pt"
          disabled={primaryDisabled}
          onClick={() => primaryCommand && void onSend(primaryCommand)}
        >
          {primaryLabel}
        </button>

        {secondaryLabel ? (
          <button
            className="action-btn action-btn--en"
            disabled={secondaryDisabled}
            onClick={() => secondaryCommand && void onSend(secondaryCommand)}
          >
            {secondaryLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}

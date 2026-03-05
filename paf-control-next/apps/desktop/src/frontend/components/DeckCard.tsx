import type { CommandId } from "@paf/protocols";

interface DeckCardProps {
  title: string;
  commandPt: CommandId;
  commandEn: CommandId;
  disabled?: boolean;
  onSend: (commandId: CommandId) => Promise<void>;
}

export function DeckCard({ title, commandPt, commandEn, disabled = false, onSend }: DeckCardProps) {
  return (
    <article className="deck-card">
      <header className="deck-card__header">
        <h2>{title}</h2>
      </header>
      <div className="deck-card__actions">
        <button className="action-btn action-btn--pt" disabled={disabled} onClick={() => void onSend(commandPt)}>
          PT
        </button>
        <button className="action-btn action-btn--en" disabled={disabled} onClick={() => void onSend(commandEn)}>
          EN
        </button>
      </div>
    </article>
  );
}

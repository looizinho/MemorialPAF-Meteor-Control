import { DeckCard } from "./components/DeckCard";
import { useControlApi } from "./hooks/useControlApi";

export function App() {
  const { state, health, uiStatus, lastCommand, lastError, sendCommand, toggleLock, setLanguage } = useControlApi();

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="hero__kicker">PAF CONTROL NEXT</p>
          <h1>Central de Automacao da Instalacao</h1>
          <p className="hero__subtitle">
            Migracao de operacao para desktop local com comandos OSC/Serial e monitoramento em tempo real.
          </p>
        </div>
        <div className="hero__controls">
          <button className="ghost-btn" onClick={() => void setLanguage("port")}>Portugues</button>
          <button className="ghost-btn" onClick={() => void setLanguage("eng")}>Ingles</button>
          <button className="lock-btn" onClick={() => void toggleLock()}>
            {state?.locked ? "Desbloquear" : "Bloquear"}
          </button>
        </div>
      </section>

      <section className="status-grid">
        <div className="status-card">
          <span>Modo Hardware</span>
          <strong>{health?.mode ?? "..."}</strong>
        </div>
        <div className="status-card">
          <span>OSC</span>
          <strong>{health?.osc ?? "..."}</strong>
        </div>
        <div className="status-card">
          <span>Serial</span>
          <strong>{health?.serial ?? "..."}</strong>
        </div>
        <div className="status-card">
          <span>Status UI</span>
          <strong>{uiStatus}</strong>
        </div>
      </section>

      <section className="decks-grid">
        <DeckCard title="O Pedro" commandPt="pedroPt" commandEn="pedroEn" disabled={state?.locked} onSend={sendCommand} />
        <DeckCard
          title="Linha do Tempo"
          commandPt="linhaPt"
          commandEn="linhaEn"
          disabled={state?.locked}
          onSend={sendCommand}
        />
        <DeckCard
          title="Multiplique-se"
          commandPt="multiPt"
          commandEn="multiEn"
          disabled={state?.locked}
          onSend={sendCommand}
        />
      </section>

      <footer className="ops-footer">
        <p>Ultimo comando: {lastCommand ?? "nenhum"}</p>
        <p>Idioma ativo: {state?.activeLang ?? "..."}</p>
        <p>Deck ativo: {state?.activeDeck || "..."}</p>
        {lastError && <p className="ops-error">Erro: {lastError}</p>}
      </footer>
    </main>
  );
}

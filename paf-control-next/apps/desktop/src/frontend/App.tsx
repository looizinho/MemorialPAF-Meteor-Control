import { DeckCard } from "./components/DeckCard";
import { useControlApi } from "./hooks/useControlApi";

export function App() {
  const { state, uiStatus, lastCommand, lastError, sendCommand, toggleLock, setLanguage } = useControlApi();

  const message = lastError
    ? "Nao foi possivel enviar o comando. Tente novamente."
    : uiStatus === "ok"
      ? "Comando enviado com sucesso."
      : state?.locked
        ? "Painel bloqueado. Toque em desbloquear para operar."
        : "Painel pronto para operacao.";

  return (
    <main className="operation-page">
      <div className="background-shape background-shape--a" />
      <div className="background-shape background-shape--b" />

      <section className="console-panel">
        <header className="console-header">
          <div>
            <p className="console-header__eyebrow">PAINEL DE CONTROLE</p>
            <h1>Instalacoes Interativas</h1>
            <p className="console-header__description">Toque na instalacao e escolha o idioma para disparar o conteudo.</p>
          </div>

          <div className="console-header__actions">
            <div className="language-switch" role="group" aria-label="Idioma principal">
              <button className={state?.activeLang === "port" ? "is-active" : ""} onClick={() => void setLanguage("port")}>
                Portugues
              </button>
              <button className={state?.activeLang === "eng" ? "is-active" : ""} onClick={() => void setLanguage("eng")}>
                Ingles
              </button>
            </div>
            <button className="lock-toggle" onClick={() => void toggleLock()}>
              {state?.locked ? "Desbloquear" : "Bloquear"}
            </button>
          </div>
        </header>

        <section className="decks-grid" aria-label="Instalacoes">
          <DeckCard
            title="Totem Entrada"
            note="Video legendado"
            primaryLabel="INICIAR"
            disabled
            onSend={sendCommand}
          />
          <DeckCard
            title="O Pedro"
            primaryLabel="PORTUGUES"
            primaryCommand="pedroPt"
            secondaryLabel="INGLES"
            secondaryCommand="pedroEn"
            disabled={state?.locked}
            onSend={sendCommand}
          />
          <DeckCard
            title="Linha do Tempo"
            primaryLabel="PORTUGUES"
            primaryCommand="linhaPt"
            secondaryLabel="INGLES"
            secondaryCommand="linhaEn"
            disabled={state?.locked}
            onSend={sendCommand}
          />
          <DeckCard
            title="Multiplique-se"
            primaryLabel="PORTUGUES"
            primaryCommand="multiPt"
            secondaryLabel="INGLES"
            secondaryCommand="multiEn"
            disabled={state?.locked}
            onSend={sendCommand}
          />
        </section>

        <footer className="console-footer" aria-live="polite">
          <p className={lastError ? "is-error" : ""}>{message}</p>
          <p>Ultimo comando: {lastCommand ?? "nenhum"}</p>
          <button className="diagnostic-button" type="button" disabled>
            Diagnostico e avancado
          </button>
        </footer>
      </section>
    </main>
  );
}

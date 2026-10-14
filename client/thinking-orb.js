import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { ThinkingOrb } from 'thinking-orbs';

// Desenha um orbe de atividade (thinking-orbs, React) dentro de `el`, que deve
// ser um elemento vazio reservado para isso.
// `props` são as opções do ThinkingOrb (state, size: 64 | 32 | 20, speed, color...).
// Devolve `atualizar(props)`, para trocar o estado ou pausar, e `desmontar()`.
export function montarThinkingOrb(el, props = {}) {
    const root = createRoot(el);
    let atuais = {};

    const atualizar = (novas = {}) => {
        atuais = { ...atuais, ...novas };
        root.render(createElement(ThinkingOrb, { theme: 'dark', ...atuais }));
    };

    atualizar(props);

    return {
        atualizar,
        desmontar() {
            root.unmount();
        },
    };
}

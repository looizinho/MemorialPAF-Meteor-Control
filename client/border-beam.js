import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { BorderBeam } from 'border-beam';

// Põe um feixe de luz (border-beam, React) na borda de `el`, que precisa ter
// `position` diferente de `static`. O feixe fica numa camada por cima, sem
// capturar toques, porque o conteúdo de `el` pertence ao Blaze.
// `props` são as opções do BorderBeam (size, colorVariant, active, duration...).
// Devolve `atualizar(props)`, para ligar/desligar ou ajustar, e `desmontar()`.
export function montarBorderBeam(el, props = {}) {
    const camada = document.createElement('span');
    camada.setAttribute('aria-hidden', 'true');
    camada.style.cssText = 'position:absolute;inset:0;pointer-events:none';
    el.appendChild(camada);

    const root = createRoot(camada);
    let atuais = {};

    const atualizar = (novas = {}) => {
        atuais = { ...atuais, ...novas };
        const cs = getComputedStyle(el);
        const borda = parseFloat(cs.borderTopWidth) || 0;
        root.render(createElement(BorderBeam, {
            theme: 'dark',
            borderRadius: parseFloat(cs.borderTopLeftRadius) || 0,
            ...atuais,
            // Estende a camada até a borda externa de `el`
            style: { position: 'absolute', inset: -borda, ...atuais.style },
        }, createElement('div', { style: { width: '100%', height: '100%' } })));
    };

    atualizar(props);

    return {
        atualizar,
        desmontar() {
            root.unmount();
            camada.remove();
        },
    };
}

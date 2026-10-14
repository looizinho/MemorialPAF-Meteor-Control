import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { MetalText, PRESETS, isMetalFxSupported, setSharedPresetMode } from 'metal-fx';

// Aplica o efeito de metal líquido (metal-fx, React) ao texto de `el`.
// Sem WebGL2 o texto original fica como está.
export function montarPafMetal(el) {
    if (!isMetalFxSupported()) return;

    const texto = el.textContent;
    const root = createRoot(el);

    // MetalText usa sempre o preset "chromatic"; isto fixa o prata em toda a página
    setSharedPresetMode(PRESETS.silver.modes.dark);

    const desenhar = () => {
        // O tamanho do título é responsivo, e MetalText precisa da fonte já resolvida
        const cs = getComputedStyle(el.parentElement);
        root.render(createElement(MetalText, {
            font: `${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily}`,
            color: cs.color,
            theme: 'dark',
        }, texto));
    };

    let quadro = 0;
    window.addEventListener('resize', () => {
        cancelAnimationFrame(quadro);
        quadro = requestAnimationFrame(desenhar);
    });

    // Espera a D-DIN carregar para o metal ser medido com a fonte certa
    document.fonts.ready.then(desenhar);
}

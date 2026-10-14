import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { MetalText, PRESETS, isMetalFxSupported, setSharedPresetMode } from 'metal-fx';

// Aplica o efeito de metal líquido (metal-fx, React) ao texto de `el`, que deve
// conter só texto. Sem WebGL2 o texto original fica como está.
// Devolve `desmontar()`, que tira o efeito e devolve o texto original.
export function montarMetalText(el) {
    if (!isMetalFxSupported()) return { desmontar() {} };

    const texto = el.textContent;
    const root = createRoot(el);
    let ativo = true;

    // MetalText usa sempre o preset "chromatic"; isto fixa o prata em toda a página
    setSharedPresetMode(PRESETS.silver.modes.dark);

    const desenhar = () => {
        if (!ativo) return;
        // O tamanho do texto é responsivo, e MetalText precisa da fonte já resolvida
        const cs = getComputedStyle(el);
        // O metal é recortado pelo texto que recebe, então aplica aqui o text-transform
        const exibido = cs.textTransform === 'uppercase' ? texto.toUpperCase() : texto;
        root.render(createElement(MetalText, {
            font: `${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily}`,
            color: cs.color,
            theme: 'dark',
        }, exibido));
    };

    let quadro = 0;
    const aoRedimensionar = () => {
        cancelAnimationFrame(quadro);
        quadro = requestAnimationFrame(desenhar);
    };
    window.addEventListener('resize', aoRedimensionar);

    // Espera a D-DIN carregar para o metal ser medido com a fonte certa
    document.fonts.ready.then(desenhar);

    return {
        desmontar() {
            ativo = false;
            cancelAnimationFrame(quadro);
            window.removeEventListener('resize', aoRedimensionar);
            root.unmount();
            el.textContent = texto;
        },
    };
}

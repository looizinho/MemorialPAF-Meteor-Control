import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

import './main.html';
import { montarMetalText } from './metal-text';
import { montarBorderBeam } from './border-beam';

// Com `?simulacao` na URL (usado por /mockup.html) os botões funcionam
// normalmente, mas nenhum comando é enviado às instalações
const SIMULACAO = new URLSearchParams(location.search).has('simulacao');

// Idioma usado pelos botões das instalações: 'Pt' ou 'En'
const idioma = new ReactiveVar('Pt');

Template.header.onRendered(function() {
    montarMetalText(this.find('.paf-metal'))
})

// Quanto tempo (ms) cada botão de instalação fica ligado depois de disparado
const TEMPO_LIGADO = {
    pedro: 10000,
    linha: 10000,
    multi: 10000,
};

// Instalações com o botão ligado neste aparelho
const ligados = new ReactiveVar(new Set());

function definirLigado(nome, valor) {
    const novos = new Set(ligados.get());
    valor ? novos.add(nome) : novos.delete(nome);
    ligados.set(novos);
}

// Enquanto ligado, cada botão de instalação acende o feixe na borda e põe o
// rótulo em metal
Template.blocks.onRendered(function() {
    for (const botao of this.findAll('.block-button')) {
        const feixe = montarBorderBeam(botao, {
            size: 'pulse-inner',
            colorVariant: 'colorful',
            // Mais forte que o padrão do pulse-inner (brilho 0.75), para se ver de longe
            brightness: 1.4,
            glowSize: 1.4,
            active: false,
        });
        const rotulo = botao.querySelector('.rotulo');
        let metal = null;

        this.autorun(() => {
            const ligado = ligados.get().has(botao.id);
            feixe.atualizar({ active: ligado });

            // Depois do Blaze aplicar a classe `ligado`, que aumenta o rótulo,
            // para o metal ser medido já no tamanho novo
            Tracker.afterFlush(() => {
                if (ligado && !metal) {
                    metal = montarMetalText(rotulo);
                } else if (!ligado && metal) {
                    metal.desmontar();
                    metal = null;
                }
            });
        });
    }
})

// Borda verde em volta da interface que se completa durante o tempo ligado
Template.progresso.onRendered(function() {
    const borda = this.find('.progresso');
    const barra = this.find('.progresso-barra');

    this.autorun(() => {
        const [nome] = ligados.get();

        if (!nome) {
            borda.classList.remove('ativo');
            barra.style.transition = 'none';
            barra.style.strokeDashoffset = '100';
            return;
        }

        // Recomeça vazia e enche em linha reta até o botão ser liberado
        barra.style.transition = 'none';
        barra.style.strokeDashoffset = '100';
        borda.classList.add('ativo');
        barra.getBoundingClientRect();
        barra.style.transition = `stroke-dashoffset ${TEMPO_LIGADO[nome]}ms linear`;
        barra.style.strokeDashoffset = '0';
    });
})

Template.blocks.helpers({
    ligado(nome) {
        return ligados.get().has(nome) ? 'ligado' : '';
    },
    pressionado(nome) {
        return ligados.get().has(nome) ? 'true' : 'false';
    },
    // Só um botão fica ligado por vez: enquanto isso, os outros ficam desabilitados
    bloqueio(nome) {
        const atuais = ligados.get();
        return atuais.size > 0 && !atuais.has(nome) ? { disabled: '' } : {};
    },
})

Template.blocks.events({
    'click button'(e) {
        const nome = e.currentTarget.id;

        // Algum botão ligado (este ou outro): ignora o toque até ele ser liberado
        if (ligados.get().size > 0) return;

        definirLigado(nome, true);
        const liberar = setTimeout(() => definirLigado(nome, false), TEMPO_LIGADO[nome]);

        if (SIMULACAO) {
            console.log(`SIMULAÇÃO ==> ${nome} ${idioma.get()}`);
            return;
        }

        Meteor.call('sendCmd', nome, idioma.get(), (erro) => {
            // Se o comando não saiu, libera o botão na hora
            if (erro) {
                clearTimeout(liberar);
                definirLigado(nome, false);
            }
        });
    }
})

Template.idiomas.helpers({
    selecionado(id) {
        return idioma.get() === id ? 'selecionado' : ''
    }
})

Template.idiomas.events({
    'click button'(e) {
        idioma.set(e.currentTarget.id)
    }
})

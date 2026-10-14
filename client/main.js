import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
import { montarPafMetal } from './paf-metal';

// Idioma usado pelos botões das instalações: 'Pt' ou 'En'
const idioma = new ReactiveVar('Pt');

Template.header.onRendered(function() {
    montarPafMetal(this.find('.paf-metal'))
})

Template.blocks.events({
    'click button'(e) {
        Meteor.call('sendCmd', e.currentTarget.id, idioma.get())
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

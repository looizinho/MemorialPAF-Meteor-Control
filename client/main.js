import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.registerHelper('txtPt', function() {
    return '🇧🇷 Português'
});

Template.registerHelper('txtEn', function() {
    return '🇺🇸 Inglês'
});

Template.blocks.events({
    'click button'(e) {
        Meteor.call('sendCmd', e.target.id)
    }
})
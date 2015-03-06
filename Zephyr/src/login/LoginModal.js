require('bootstrap/js/modal');
require('bootstrap/js/tab');
require('bootstrap-validator');

import Radio from 'backbone.radio';
import {ItemView} from 'backbone.marionette';
import db from 'pouchdb-authentication';

export default ItemView.extend({
    template: require('./template.hbs'),
    id: 'login',

    events: {
        'submit form': 'onSubmit'
    },

    initialize() {
        this.channel = Radio.channel('auth');
    },

    onRender() {
        this.$('> .modal').modal({
            keyboard: false
        });
        this.$('form').validator({
            disable: true
        });
    },

    onSubmit(event) {
        event.preventDefault();
        let $form = this.$(event.currentTarget);
        if ($form.find(':submit').is('.disabled')) {
            return;
        }
        let username = $form.find('.user').val();
        let password = $form.find('.pass').val();
        if ($form.parent().is('#signin')) {
            this.channel.command('login', username, password, $form.find('#rememberme').is(':checked'));
        } else {
            db.signup(username, password, {
                metadata : {
                    email : $form.find('#email').val()
                }
            }, (err, response) => {

            });
        }
    }
});
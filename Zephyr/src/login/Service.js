// Very simplistic authentication layer, to be
// replaced for use in anything important with a
// token based system.

import Radio from 'backbone.radio';
import db from 'pouchdb-authentication';
import ls from 'local-storage';
import _ from 'underscore';

import LoginModal from './LoginModal';

let channel = Radio.channel('auth');
let session = false;
let user = 'susername', pass = 'spassword';


channel.comply('login', (username, password, remember) => {
    if (user && password && remember) {
        ls(user, username);
        ls(pass, password);
    } else {
        username = ls(user);
        password = ls(pass);
    }
    if (session) {
        callback(null, session);
    } else if (!_.all([username, password], _.isString)) {
        Radio.channel('content').command('prompt', new LoginModal());
    } else {
        db.login(username, password, (err, resp) => {
            if (err) {
                channel.command('login:fail', err);
            } else {
                channel.command('loggedin');
                session = resp;
            }
        });
    }
});

channel.comply('logout', () => {
    _.each([user, pass], ls.remove, ls);
    db.logout();
    channel.command('loggedout');
});

channel.reply('session', () => {
    return session;
});

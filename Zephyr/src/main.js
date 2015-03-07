import './mixins';

// Radio channels
import Radio from 'backbone.radio';

import {ready} from 'jquery';
import Backbone from 'backbone';
import Application from './application/application';

require('./map/Service');
require('./header/Service');

let app = new Application();

Promise.all([ready.promise()]).then(() => app.start());

app.on('start', () => {
    Radio.channel('header').command('show');
    Radio.channel('map').command('show');

    Backbone.history.start();
});

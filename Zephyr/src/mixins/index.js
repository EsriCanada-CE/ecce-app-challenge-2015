'use strict';

import Intercept from 'backbone.intercept';
import jQuery from 'jquery';


global.$ = global.jQuery = require('backbone').$ = jQuery;
global.Promise = require('native-promise-only');

require('./leaflet-setup');
require('./service-worker');
require('./Handlebar-mixins');

jQuery.ready(() => {
    Intercept.start({
      links: false
    });
});

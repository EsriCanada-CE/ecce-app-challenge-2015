import View from './View';
import Model from './Route';

import Radio from 'backbone.radio';

let channel = Radio.channel('map');

channel.comply('show', () => {
    Radio.channel('content').command('content', new View({model: new Model()}));
});

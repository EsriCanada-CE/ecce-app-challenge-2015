import View from './View';

import Radio from 'backbone.radio';

let channel = Radio.channel('header');

channel.comply('show', () => {
    Radio.channel('content').command('header', new View());
});

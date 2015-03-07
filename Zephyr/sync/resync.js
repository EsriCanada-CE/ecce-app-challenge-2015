// Small script to resync resources - to be executed periodicaly in app runtime

import npm from 'npm';
import logalog from '../utils/logalog'

export default function sync() {
    npm.load(err => {
        logalog.info('Preparing to resynchronize static resources');
        // catch errors
        npm.commands['run-script'](['sync'], (er, data) => {
            logalog.info('done sync!')
        });
        npm.on('log', (message) => {
            logalog.info(message);
        });
    });
};

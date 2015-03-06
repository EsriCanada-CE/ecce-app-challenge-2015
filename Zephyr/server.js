#!/bin/env node

import express from 'express';
import compression from 'compression';
import resync from './sync/resync';
import logalog from './utils/logalog'

let app = express();
let port = process.env.PORT || 3000;

// Resync resources once an hour
logalog.debug('\n\n\tPrepared resync once every hour.\n\n');
setInterval(resync, 3.6e6);

// Setup gzipping
app.use(compression());

app.use(express.static('./dist'));
logalog.info('Now listening on port', port);
logalog.info(`Navigate to http://localhost:${port}`);
app.listen(port);

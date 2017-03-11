let Processor = require('./processor'),
         config = require('./config');

let processor = new Processor();

processor.set('rawDataDir', config.rawDataDir);
processor.set('dataDir', config.dataDir);
processor.set('processDelay', config.processDelay);

processor.start();
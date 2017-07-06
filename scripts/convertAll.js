const convert = require('../automator/converter');
const FileHandler = require('../manager/filehandler');

new FileHandler();

convert([], () => {
  console.log('Work done.');
});

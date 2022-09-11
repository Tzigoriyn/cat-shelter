const homeHandler = require('./home');
const staticFiles = require('./static-files');
const catsHandler = require('./cat')

module.exports = [homeHandler, staticFiles, catsHandler];
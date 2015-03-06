// http://vignette2.wikia.nocookie.net/redwall/images/9/91/Log-a-logTVshow.JPG/revision/latest?cb=20101121232931
var Chill = require("winston-chill");

var logger = new Chill()
                 .environment("development")
                 .getLogger();

module.exports = logger;

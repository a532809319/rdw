var ascoltatori = require('ascoltatori');



ascoltatori.build(function (err, ascoltatore) {
	module.exports.broker =ascoltatore
});

  
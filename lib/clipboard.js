
(function (module) {
	'use strict';

	module.exports = {
		copySelection: copySelection
	};

	function copySelection() {
		atom.clipboard.write(String(getSelection()));
	}

})(module);


function KSXAtomSupports() {
	'use strict';

	var self = this;

	add("menu", "js");
	add("pane-view", "js");
	add("editor", "js");
	add("clipboard", "js");
	// add("xml-iterator", "js");
	// add("loadxml", "js"); // will be enabled whenever V8's bugs are fixed.

	function add(name, ext) {
		Object.defineProperty(self, name.replace('-', '_'), {
			value: require(`./lib/${name}.${ext}`),
			enumarable: true,
			writable: false,
			configurable: false
		});
	}

}

module.exports = new KSXAtomSupports();

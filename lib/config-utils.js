
(function (module) {
	'use strict';

	var Disposable = require('atom').CompositeDisposable;

	class ConfigObserver {

		constructor(key) {

			if (key === undefined || key === null) {
				key = '';
			} else if (typeof key !== 'string') {
				throw new TypeError(`Invalid type of parameter 'key': ${typeof key}`);
			}

			this.key = key;

		}

		observe(handle) {
			return atom.config.observe(this.key, handle);
		}

		onDidChange(handle) {
			return atom.config.onDidChange(this.key, handle);
		}

		onMemberChange(handle) {

			var disposable = new Disposable();
			var globalchanged = true;

			for (let subkey in atom.config.get(this.key)) {
				ConfigObserver.create(`${this.key}.${subkey}`).onMemberChange((change) => {
					globalchanged = false;
					handle(change);
				});
			}

			ConfigObserver.addChangeHandle(disposable, key, (change) => globalchanged ? onmemberadd(change, handle) : (globalchanged = true));

			return disposable;

		}

		static create(key) {
			return new ConfigObserver(key);
		}

		static addChangeHandle(disposable, key, handle) {
			disposable.add(atom.config.onDidChange(key, handle));
		}

	}

	function onmemberadd(change, handle) {

		// Find which member has added

		// Call handle
		handle({});

	}

	module.exports = {
		ConfigObserver: ConfigObserver
	};

})(module);

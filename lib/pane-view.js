
(function (module, undefined) {
	'use strict';

	var EventEmitter = require('events');
	var CompositeDisposable = require('atom').CompositeDisposable;

	module.exports = {
		SimplePaneItem: SimplePaneItem,
		registerPaneItem: registerPaneItem
	};

	class PaneEventEmitter extends EventEmitter {

		constructor(paneitem) {
			super();
			var emitter = paneitem.emitter = this;
		}

		onWillDestroy(listener) {
			return this.on('will-destroy', listener);
		}

		onDidDestroy(listener) {
			return this.on('did-destroy', listener);
		}

		onDidActive(listener) {
			return this.on('did-active', listener);
		}

		static create(paneitem) {
			return new PaneEventEmitter(paneitem);
		}

	}

	function SimplePaneItem(unique) {

		((workspace) => {

			var attachEventHandle = (pane) =>
				onDidChangeActiveItem(pane, emitPaneItem);

			var onDidChangeActiveItem = (pane, handle) =>
				typeof pane.onDidChangeActiveItem === 'function' && pane.onDidChangeActiveItem(handle);

			var emitPaneItem = (item) =>
				item instanceof PaneItem && item.emit('did-active', {item: item});

			workspace.onDidAddPane(attachEventHandle);
			workspace.getPanes().forEach(attachEventHandle);

		})(atom.workspace);

		class PaneItem {

			constructor(properties) {
				var paneitem = this;
				var uObj = checkUnique(properties);
				if (uObj) {
					return uObj;
				}
				Object.assign(properties);
				Object.getOwnPropertyNames(properties).forEach(makePropertyGetter.bind(null, paneitem, properties));
				PaneEventEmitter.create(paneitem);
				paneitem.alive = true;
				paneitem.disposables = new CompositeDisposable();
			}

			on(event, listener) {
				this.emitter.on(event, listener);
				return this;
			}

			onWillDestroy(listener) {
				this.emitter.onWillDestroy(listener);
				return this;
			}

			onDidDestroy(listener) {
				this.emitter.onDidDestroy(listener);
				return this;
			}

			onDidActive(listener) {
				this.emitter.onDidActive(listener);
				return this;
			}

			emit(event, param) {
				return this.emitter.emit(event, param);
			}

			destroy() {
				this.emit('will-destroy', {item: this});
				if (this.alive) {
					this.alive = false;
					this.emit('did-destroy', {item: this});
					atom.workspace.getPanes().forEach((pane) => pane.destroyItem(this));
					return true;
				}
				return false;
			}

			dispose() {
				this.disposables.dispose();
			}

			getPath() {
				return this.path;
			}

			getView() {
				return atom.views.getView(this);
			}

			get view() {
				return this.getView();
			}

			static addViewProvider(provider) {
				return atom.views.addViewProvider(PaneItem, provider);
			}

			static addOpener(opener) {
				return atom.workspace.addOpener((uri) => {
					var properties = opener(uri);
					return properties ? new PaneItem(properties) : undefined;
				});
			}

		}

		var checkUnique;

		switch (typeof unique) {
			case 'undefined':
				checkUnique = () => {};
				break;
			case 'object':
				let uObj;
				checkUnique = () => uObj;
				uObj = new PaneItem(unique);
				break;
			case 'function':
				checkUnique = unique;
				break;
			default:
				throw new TypeError("Invalid type of parameter 'unique'.");
		}

		return PaneItem;

		function makePropertyGetter(object, properties, pname) {
			object[`get${pname[0].toUpperCase()}${pname.slice(1)}`] = () => properties[pname];
		}

	}

	function registerPaneItem(provider, opener, unique) {

		var actual_provider;
		switch (typeof provider) {
			case 'function':
				actual_provider = provider;
				break;
			case 'string':
				actual_provider = () => {
					var element = document.createElement('div');
					element.textContent = provider;
					return element;
				};
				break;
			case 'object':
				actual_provider = () => provider;
				break;
			default:
				throw new TypeError("Parameter 'provider' has invalid type.");
		}

		var actual_opener;
		switch (typeof opener) {
			case 'function':
				actual_opener = opener;
				break;
			case 'string':
				actual_opener = (uri) => opener === uri && {title: uri};
				break;
			case 'object':
				actual_opener = (uri) => opener.exec(uri) && {title: uri};
				break;
			default:
				throw new TypeError("Parameter 'opener' has invalid type.");
		}

		var PaneItem = SimplePaneItem(unique);
		var viewProviderDisposable = PaneItem.addViewProvider(actual_provider);
		var openerDisposable = PaneItem.addOpener(actual_opener);

		return {
			PaneItem: PaneItem,
			viewProviderDisposable: viewProviderDisposable,
			openerDisposable: openerDisposable,
			dispose: dispose
		};

		function dispose() {
			viewProviderDisposable.dispose();
			openerDisposable.dispose();
		}

	}

})(module);

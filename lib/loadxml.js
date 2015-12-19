
function XMLLoader() {
	'use strict';

	var loader = this;

	loader.type = 'text/xml';
	loader.domparser = new DOMParser();

	class IDList {

		constructor(element) {
			var Tree = require('./xml-iterator.js').TreeClass('children');
			for (let child of new Tree(element)) {
				let id = child.id;
				if (id) {
					this[id] = child;
				}
			}
		}

	}

	loader.createDocumentFromSource = createDocumentFromSource;
	loader.createIdListFromElement = createIdListFromElement;
	loader.createIdListFromDocument = createIdListFromDocument;
	loader.createIdListFromSource = createIdListFromSource;
	loader.createIdListFromURL = createIdListFromURL;

	function createDocumentFromSource(source) {
		return loader.domparser.parseFromString(source, loader.type);
	}

	function createIdListFromElement(element) {
		return new IDList(element);
	}

	function createIdListFromDocument(document) {
		return new IDList(document.documentElement);
	}

	function createIdListFromSource(source) {
		return createIdListFromDocument(createDocumentFromSource(source));
	}

	function createIdListFromURL(url, callback) {
		return require('fs')
			.readFile(url, {
				encoding: 'utf8'
			}, (error, content) => {
				callback(error, createIdListFromSource(content))
			});
	}

}

module.exports = new XMLLoader();

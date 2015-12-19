
(function (module) {
	'use strict';

	var dirname = require('path').dirname;

	class EditorUtil {

		constructor(editor) {
			this.editor = editor || atom.workspace.getActivePaneItem();
		}

		get file() {
			if (this.editor && typeof this.editor.getPath === 'function') {
				return this.editor.getPath();
			}
		}

		get dir() {
			return dirname(this.file);
		}

		get element() {
			return atom.views.getView(this.editor);
		}

		static new(param) {
			return new EditorUtil(atom.workspace.buildTextEditor(param));
		}

		static create(editor) {
			return new EditorUtil(editor);
		}

		static get current() {
			return EditorUtil.create();
		}

	}

	module.exports = {
		EditorUtil: EditorUtil
	}

})(module);


(function (module) {
	'use strict';

	var _key_iterator = Symbol.iterator;

	module.exports = {
		IterableClass: IterableClass,
		TreeClass: TreeClass
	};

	function IterableClass(pname, upper) {

		return class Iterable extends createExtendableClassBy(upper || IterableClass.prototype) {

			contructor(node, param) {
				super(node, param); // because of V8's bug, this stuff still unusable
				this.node = node;
			}

			* [_key_iterator] () {
				yield * Array.from(this.node[pname]);
			}

			static create(node, param) {
				return new Iterable(node, param);
			}

		};

	}

	//function TreeClass(pname, upper) {
	function TreeClass(pname) {

		var List = IterableClass(pname);

		//return class Tree extends createExtendableClassBy(upper || TreeClass.prototype) {
		return class Tree {

			constructor(node, param) {
				super(node, param); // because of V8's bug ...
				this.node = node;
			}

			* [_key_iterator]() {
				var node = this.node;
				yield node;
				for (let child of new List(node)) {
					yield * new Tree(child);
				}
			}

			static create(node, param) {
				return new Tree(node, param);
			}

		}

	}

	function createConstructorOf(proto) {
		result.prototype = proto;
		return result;
		function result() {}
	}

	function createExtendableClassBy(base) {
		return typeof base === "function" ? base : createConstructorOf(base);
	}

})(module);

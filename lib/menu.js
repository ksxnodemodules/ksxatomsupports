
function MenuHelper() {
	'use strict';

	var listpname = Object.getOwnPropertyNames;
	var createobj = Object.create;

	var helper = this;

	class MenuDescriptor {

		constructor(label, content) {

			var descriptor = this;

			descriptor.label = label;

			if (!content) return;

			switch (typeof content) {
				case "string":
					descriptor.command = content;
					break;
				case "object":
					descriptor.submenu = createDescriptorArrayFromSimpleJSON(content);
					break;
				default:
					throw new TypeError("Invalid type of parameter 'content'.");
			}

		}

		install(manager) {
			return manager.add([this]);
		}

		uninstall(manager) {
			return manager.remove([this]);
		}

		toSimpleJSON() {
			return createSimpleJSONFromArray([this]);
		}

		static arrayFromSimpleJSON(object) {
			return createDescriptorArrayFromSimpleJSON(object);
		}

	}

	class ManageHelper {

		constructor(manager) {

			Object.assign(this, {
				addBySimpleJSON: (object) => manager.add(createDescriptorArrayFromSimpleJSON(object)),
				removeBySimpleJSON: (object) => manager.remove(createDescriptorArrayFromSimpleJSON(object)),
				addByPath: (path, command) => manager.add(createNestedFromPath(path, command)),
				removeByPath: (path) => manager.remove(createNestedFromPath(path))
			});

		}

	}

	Object.setPrototypeOf(ManageHelper.prototype, helper);

	helper.MenuDescriptor = MenuDescriptor;
	helper.ManageHelper = ManageHelper;
	helper.createDescriptorArrayFromSimpleJSON = createDescriptorArrayFromSimpleJSON;
	helper.createNestedFromPath = createNestedFromPath;
	helper.createSimpleJSONFromArray = createSimpleJSONFromArray;

	function createDescriptorArrayFromSimpleJSON(object) {
		return listpname(object).map((pname) => new MenuDescriptor(pname, object[pname]));
	}

	function createNestedFromPath(path, command, target) {
		if (!target) {
			target = [];
		}
		var index = path.length - 1;
		if (index < 0) {
			throw new RangeError("Invalid length of array 'path'.");
		}
		target.push((function recursion(index, prev) {
			var current = {
				label: String(path[index]),
				submenu: prev
			};
			return index ? recursion(index - 1, [current]) : current;
		}).apply(null, command ? [index - 1, [{
			label: String(path[index]),
			command: String(command)
		}]] : [index]));
		return target;
	}

	function createSimpleJSONFromArray(array) {
		var result = createobj(null);
		if (!array) {
			return result;
		}
		array.forEach((descriptor) => {
			result[descriptor.label] = descriptor.command || createSimpleJSONFromArray(descriptor.submenu);
		});
		return result;
	}

}

module.exports = new MenuHelper();

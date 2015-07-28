/* ************************************************************************

   server-objects - a contrib to the Qooxdoo project (http://qooxdoo.org/)

   http://qooxdoo.org

   Copyright:
     2010 Zenesis Limited, http://www.zenesis.com

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     
     This software is provided under the same licensing terms as Qooxdoo,
     please see the LICENSE file in the Qooxdoo project's top-level directory 
     for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com)

************************************************************************ */

/**
 * Implementation of Map, which is a set of key:value pairs with event handlers and where the
 * keys and values are qx.data.Array; this supports binding and particularly provides a client
 * based equivalent of Java java.util.Map 
 */
qx.Class.define("com.zenesis.qx.remote.Map", {
	extend: qx.core.Object,
	
	construct: function(values) {
		this.base(arguments);
		this.__lookup = {};
		this.set({ keys: new qx.data.Array, values: new qx.data.Array });
		if (values !== undefined) {
			this.replaceAll(values);
		}
	},
	
	events: {
		/**
		 * Fired when the map changes, data is a map containing:
		 * 	type {String} one of "put", "remove"
		 * 	values {Object[]} values which had changed, each map contains:
		 * 	  key {String}
		 * 	  value {Object}
		 * 	  oldValue {Object?}
		 */
		"change": "qx.event.type.Data"
	},
	
	properties: {
		/**
		 * List of all keys in the map, should never be set explicitly
		 */
		keys: {
			nullable: false,
			check: "qx.data.Array",
			event: "changeValues",
			apply: "_applyKeys"
		},
		
		/**
		 * List of all values in the map, should never be set explicitly
		 */
		values: {
			nullable: false,
			check: "qx.data.Array",
			event: "changeValues",
			apply: "_applyValues"
		}
	},
	
	members: {
		// Implementation of the map
		__lookup: null,
		
		/**
		 * Gets a value from the map
		 * @param key {String} the key to lookup
		 * @returns {Object?} the object that was found, or undefined
		 */
		get: function(key) {
			return this.__lookup[key];
		},
		
		/**
		 * Puts a new value in the map
		 * @param key {String} the key to assign
		 * @param value {Object} the object to set for the key, if undefined the key is removed
		 * @returns {Object?} the previous object for the key, or undefined
		 */
		put: function(key, value) {
			if (value === undefined) {
				return this.remove(key);
			}
			
			var values = this.getValues();
			var keys = this.getKeys();
			
			var oldValue = this.__lookup[key];
			this.__lookup[key] = value;
			if (oldValue !== undefined)
				values.remove(oldValue);
			values.push(value);
			if (!keys.contains(value))
				keys.push(key);
			
			this.fireDataEvent("change", { type: "put", values: [ { key: key, value: value, oldValue: oldValue } ] });
			return oldValue;
		},
		
		/**
		 * Replaces all of the elements in this map with another, firing only one or two
		 * "change" events for "put" and/or "remove"
		 * @param src {com.zenesis.qx.remote.Map|Object} the map or object to copy from
		 */
		replaceAll: function(src) {
			if (src instanceof com.zenesis.qx.remote.Map)
				src = src.toObject();
			var values = this.getValues();
			var keys = this.getKeys();
			var removed = [];
			for (var name in this.__lookup)
				if (src[name] === undefined) {
					var tmp = this.__lookup[name];
					removed.push({ key: name, value: tmp });
					delete this.__lookup[name];
					values.remove(tmp);
					keys.remove(name);
				}
			var changed = [];
			for (var name in src) {
				var value = this.__lookup[name];
				if (value === undefined) {
					var tmp = src[name];
					values.push(tmp);
					keys.push(name);
					changed.push({ key: name, value: tmp });
					
				} else if (value !== src[name]) {
					values.remove(value);
					values.push(src[name]);
					changed.push({ key: name, value: src[name], oldValue: value });
				}
				this.__lookup[name] = src[name];
			}
			if (Object.keys(removed).length !== 0)
				this.fireDataEvent("change", { type: "remove", values: removed });
			if (Object.keys(changed).length !== 0)
				this.fireDataEvent("change", { type: "put", values: changed });
		},
		
		/**
		 * Removes a key:value pair
		 * @param key {String} the key to remove
		 * @returns {Object} the previous value for the key, or undefined
		 */
		remove: function(key) {
			var value = this.__lookup[key];
			if (value !== undefined) {
				delete this.__lookup[key];
				this.getKeys().remove(key);
				this.getValues().remove(value);
				this.fireDataEvent("change", { type: "remove", values: [ { key: key, value: value } ] });
			}
			return value;
		},
		
		/**
		 * Removes all entries from the map
		 */
		removeAll: function() {
			var old = [];
			for (var name in this.__lookup)
				old.push({ key: name, value: this.__lookup[name] });
			this.__lookup = {};
			this.getValues().removeAll();
			this.getKeys().removeAll();
			this.fireDataEvent("change", { type: "remove", values: old });
		},
		
		/**
		 * Number of entries in the map
		 * @returns {Integer}
		 */
		getLength: function() {
			return this.getKeys().getLength();
		},
		
		/**
		 * Returns true if the map is empty
		 * @returns {Boolean}
		 */
		isEmpty: function() {
			return this.getLength() == 0;
		},
		
		/**
		 * Detects whether the key is in use
		 * @param key {String}
		 * @returns {Boolean}
		 */
		containsKey: function(key) {
			return this.__lookup[key] !== undefined;
		},
		
		/**
		 * Detects whether the value is in use
		 * @param value {Object}
		 * @returns {Boolean}
		 */
		containsValue: function(value) {
			return this.getValues().indexOf(value) > -1;
		},
		
		/**
		 * Returns the native object containing the lookup; note that this is the actual
		 * object and should not be dircetly modified (IE clone it if you're going to edit it)
		 */
		toObject: function() {
			return this.__lookup;
		},
		
		/**
		 * Apply method for values property
		 * @param value
		 * @param oldValue
		 */
		_applyValues: function(value, oldValue) {
			if (oldValue)
				throw new Error("Cannot change property values of com.zenesis.qx.remote.Map");
		},
		
		/**
		 * Apply method for keys property
		 * @param value
		 * @param oldValue
		 */
		_applyKeys: function(value, oldValue) {
			if (oldValue)
				throw new Error("Cannot change property keys of com.zenesis.qx.remote.Map");
		}
	}
});
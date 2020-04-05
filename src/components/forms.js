/**
 * Forms Module
 *
 * Classes and functions used by all forms
 *
 * @author Chris Nasr
 * @copyright OuroborosCoding
 * @create 2018-12-08
 */

// NPM modules
import React from 'react';

// Error class define
var ERROR_CLASS = 'error';

/**
 * Add Class
 *
 * Adds the error class name to an element
 *
 * @name _addClass
 * @access private
 * @param Element el	The element to remove the class from
 */
function _addClass(el) {
	if(!el.className) {
		el.className = ERROR_CLASS;
	} else {
		let names = el.className.split(' ');
		if(names.indexOf(ERROR_CLASS) === -1) {
			names.push(ERROR_CLASS);
			el.className = names.join(' ');
		}
	}
}

/**
 * Remove Class
 *
 * Removes the error class name from an element
 *
 * @name _removeClass
 * @access private
 * @param Element el	The element to remove the class from
 * @return void
 */
function _removeClass(el) {
	if(el.className.includes(ERROR_CLASS)) {
		let names = el.className.split(' ');
		names.splice(names.indexOf(ERROR_CLASS), 1);
		el.className = names.join(' ')
	}
}

// Create the Base Node Component
class _BaseNode extends React.PureComponent {

	errors(errors) {
		for(let k in errors) {
			if(this.refs[k].errors) {
				this.refs[k].errors(errors[k]);
			} else {
				_addClass(this.refs[k]);
			}
		}
	}
}

// Create the Array Form Component
class ArrayNode extends _BaseNode {

	get value() {

		// Init the return
		var value = []

		// Go through all refs
		for(var r in this.refs) {
			if(this.refs[r].type && this.refs[r].type === 'checkbox') {
				value.push(this.refs[r].checked);
			} else {
				value.push(this.refs[r].value);
			}
		}

		// Return the values
		return value;
	}
}

class Node extends React.PureComponent {

	errors(msg) {
		if(this.refs.el.errors) {
			this.refs.el.errors(msg);
		} else {
			_addClass(this.refs.el);
		}
	}

	get value() {
		return this.refs.el.value;
	}

	set value(v) {
		this.refs.el.value = v;
		if(this.valueSet) {
			this.valueSet();
		}
	}
}

// Create the base Component
class Parent extends _BaseNode {

	get value() {

		// Init the return
		var value = {}

		// Go through all refs
		for(var r in this.refs) {
			if(this.refs[r].type && this.refs[r].type === 'checkbox') {
				value[r] = this.refs[r].checked;
			} else {
				value[r] = this.refs[r].value;
			}
		}

		// Return the value
		return value;
	}
}

// Export the module
export default {
	ArrayNode: ArrayNode,
	Node: Node,
	Parent: Parent,
	errorAdd: _addClass,
	errorRemove: _removeClass,
	errorFocus: function(ev) {

		// If the special elements prop is set
		if(ev.elements) {
			for(var i = 0; i < ev.elements.length; ++i) {
				_removeClass(ev.elements[i]);
			}
		}

		// Else, assuming currentTarget
		else {
			_removeClass(ev.currentTarget);
		}
	}
};

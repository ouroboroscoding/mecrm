/**
 * Format Node
 *
 * Handles a single FormatOC node
 *
 * @author Chris Nasr
 * @copyright MaleExcelMedical
 * @created 2020-04-10
 */

// NPM modules
import React from 'react';
import FNode from 'format-oc/Node';
import PropTypes from 'prop-types';

// Material UI
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import NativeSelect from '@material-ui/core/NativeSelect';
import TextField from '@material-ui/core/TextField';

/**
 * Node Base
 *
 * Base class for all node types
 *
 * @extends React.Component
 */
class NodeBase extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			"error": false,
			"value": 'value' in props ? props.value : null
		}
	}
	get value() {
		return this.state.value;
	}
	set value(val) {
		this.setState({"value": val});
	}
}

// Force props
NodeBase.propTypes = {
	"name": PropTypes.string.isRequired,
	"node": PropTypes.instanceOf(FNode).isRequired,
	"value": PropTypes.any
}

/**
 * Node Bool
 *
 * Handles values of a true/false state
 *
 * @extends React.Component
 */
class NodeBool extends NodeBase {

	constructor(props) {
		super(props);
		this.change = this.change.bind(this);
	}

	change(event) {
		// Impossible for this to be invalid, so just store it
		this.setState({"value": event.target.checked});
	}

	render() {
		return (
			<FormControlLabel
				control={<Checkbox
							color="primary"
							checked={this.state.value}
							onChange={this.change}
						/>}
				label={this.props.node.special('title') || this.props.name}
			/>
		);
	}
}

/**
 * Node Date
 *
 * Handles values that represent a date
 *
 * @extends NodeBase
 */
class NodeDate extends NodeBase {

	constructor(props) {
		super(props);
		this.change = this.change.bind(this);
	}

	change(event) {

		// Get the new date and check if it's valid
		let newDate = event.target.value;
		let error = false;
		if(!this.props.node.valid(newDate)) {
			error = 'Invalid Date';
		}

		// Update the state
		this.setState({
			"error": error,
			"value": event.target.newDate
		});
	}

	render() {
		return (
			<TextField
				error={this.state.error !== false}
				helperText={this.state.error}
				label={this.props.node.special('title') || this.props.name}
				onChange={this.change}
				type="date"
				value={this.state.value}
				InputLabelProps={{
					shrink: true,
				}}
			/>
		);
	}
}

/**
 * Node Datetime
 *
 * Handles values that represent a date with a time
 *
 * @extends NodeBase
 */
class NodeDatetime extends NodeBase {

	constructor(props) {
		super(props);
		this.change = this.change.bind(this);
	}

	change(event) {

		// Get the new value
		let newDatetime = event.target.value;

		// Remove the T and add the empty seconds
		newDatetime = newDatetime.replace('T', ' ') + ':00';

		// Check if it's valid
		let error = false;
		if(!this.props.node.valid(newDatetime)) {
			error = 'Invalid Date/Time';
		}

		// Update the state
		this.setState({
			"error": error,
			"value": newDatetime
		});
	}

	render() {
		return (
			<TextField
				error={this.state.error !== false}
				helperText={this.state.error}
				label={this.props.node.special('title') || this.props.name}
				onChange={this.change}
				type="datetime-local"
				value={this.state.value}
				InputLabelProps={{
					shrink: true,
				}}
			/>
		);
	}
}

/**
 * Node Number
 *
 * Handles values that represent numbers (ints, floats, decimal)
 *
 * @extends NodeBase
 */
class NodeNumber extends NodeBase {

	constructor(props) {
		super(props);
		this.change = this.change.bind(this);
	}

	change(event) {

		// Get the new value and check if it's valid
		let newNumber = event.target.value;
		let error = false;
		if(!this.props.node.valid(newNumber)) {
			error = 'Invalid Value';
		}

		// Update the state
		this.setState({
			"error": error,
			"value": newNumber
		});
	}

	render() {
		let props = {}
		let minmax = this.props.node.minmax();
		if(minmax.minimum) {
			props.min = minmax.minimum;
		}
		if(minmax.maximum) {
			props.max = minmax.maximum;
		}

		return (
			<TextField
				error={this.state.error !== false}
				helperText={this.state.error}
				label={this.props.node.special('title') || this.props.name}
				onChange={this.change}
				type="number"
				value={this.state.value}
				InputLabelProps={{
					shrink: true,
				}}
				{...props}
			/>
		);
	}
}

/**
 * Node Select
 *
 * Handles values that have specific options
 *
 * @extends NodeBase
 */
class NodeSelect extends NodeBase {

	constructor(props) {
		super(props);
		this.change = this.change.bind(this);
	}

	change(event) {

		// Get the new value with the empty seconds and check if it's valid
		let newOpt = event.target.value;
		let error = false;
		if(!this.props.node.valid(newOpt)) {
			error = 'Invalid Selection';
		}

		// Update the state
		this.setState({
			"error": error,
			"value": newOpt
		});
	}

	render() {

		// If we have display options
		let lDisplayOptions = this.props.node.special('display_options');
		if(!lDisplayOptions) {
			lDisplayOptions = this.props.node.options().map(s => [s, s]);
		}
		console.log(lDisplayOptions);

		// Init the option elements
		let lOpts = [];

		// If the field is optional, add an empty value
		if(this.props.node.optional()) {
			lOpts.push(<option key={0} value=''></option>);
		}

		// Add the other options
		for(let i in lDisplayOptions) {
			lOpts.push(<option key={i+1} value={lDisplayOptions[i][0]}>{lDisplayOptions[i][1]}</option>);
		}

		return (
			<FormControl>
				<InputLabel
					error={this.state.error !== false}
					htmlFor={this.props.name + "-native-select"}
				>
					{this.props.node.special('title') || this.props.name}
				</InputLabel>
				<NativeSelect
					inputProps={{
						"id": this.props.name + "-native-select"
					}}
					onChange={this.change}
					value={this.state.value}
				>
					{lOpts}
				</NativeSelect>
				{this.state.error &&
					<FormHelperText>{this.state.error}</FormHelperText>
				}
			</FormControl>
		);
	}
}

/**
 * Node Text
 *
 * Handles values that are strings or string-like
 *
 * @extends NodeBase
 */
class NodeText extends NodeBase {

	constructor(props) {
		super(props);
		this.change = this.change.bind(this);
	}

	change(event) {

		// Get the new value and check if it's valid
		let newText = event.target.value;
		let error = false;
		if(!this.props.node.valid(newText)) {
			error = 'Invalid Value';
		}

		// Update the state
		this.setState({
			"error": error,
			"value": newText
		});
	}

	render() {
		let props = {}
		let minmax = this.props.node.minmax();
		if(minmax.maximum) {
			props.max = minmax.maximum;
		}

		return (
			<TextField
				error={this.state.error !== false}
				helperText={this.state.error}
				label={this.props.node.special('title') || this.props.name}
				onChange={this.change}
				type="text"
				value={this.state.value}
				InputLabelProps={{
					shrink: true,
				}}
				{...props}
			/>
		);
	}
}

/**
 * Node Time
 *
 * Handles values that represent a time
 *
 * @extends NodeBase
 */
class NodeTime extends NodeBase {

	constructor(props) {
		super(props);
		this.change = this.change.bind(this);
	}

	change(event) {

		// Get the new value with the empty seconds and check if it's valid
		let newTime = event.target.value + ':00';
		let error = false;
		if(!this.props.node.valid(newTime)) {
			error = 'Invalid Time';
		}

		// Update the state
		this.setState({
			"error": error,
			"value": newTime
		});
	}

	render() {
		return (
			<TextField
				error={this.state.error !== false}
				helperText={this.state.error}
				label={this.props.node.special('title') || this.props.name}
				onChange={this.change}
				type="time"
				value={this.state.value}
				InputLabelProps={{
					shrink: true,
				}}
			/>
		);
	}
}

// Node
export default class Node extends React.Component {

	constructor(props) {

		// Call parent
		super(props);

		// Check for a display type
		let sType = props.node.special('display') || this.defaultType(props.node);

		// Init state
		this.state = {
			"name": props.name,
			"node": props.node,
			"type": sType,
			"value": props.value || ''
		}
	}

	// Figure out the element type based on the default values of the node
	defaultType(node) {

		// If it has options, it's a select, no question
		if(node.options()) {
			return 'NodeSelect';
		}

		// Get the node type
		let sType = node.type();

		// Figure it out by type
		switch(sType) {

			// If it's a string type at its core
			case 'any':
			case 'base64':
			case 'ip':
			case 'json':
			case 'md5':
			case 'string':
			case 'uuid':
			case 'uuid4':
				return 'text';

			// If it's a number
			case 'decimal':
			case 'float':
			case 'int':
			case 'price':
			case 'timestamp':
			case 'uint':
				return 'number';

			// Else it's its own type
			case 'bool':
			case 'date':
			case 'datetime':
			case 'time':
				return sType;

			default:
				throw new Error('invalid type in format/Node');
		}
	}

	render() {

		// Get the component name based on the type
		let ElName = null;
		switch(this.state.type) {
			case 'bool': ElName = NodeBool; break;
			case 'date': ElName = NodeDate; break;
			case 'datetime': ElName = NodeDatetime; break;
			case 'number': ElName = NodeNumber; break;
			case 'select': ElName = NodeSelect; break;
			case 'text': ElName = NodeText; break;
			case 'time': ElName = NodeTime; break;
			default:
				throw new Error('invalid type in format/Node');
		}

		return (
			<ElName
				name={this.props.name}
				node={this.props.node}
				value={this.state.value}
			/>
		);
	}
}

// Force props
Node.propTypes = {
	"name": PropTypes.string.isRequired,
	"node": PropTypes.instanceOf(FNode).isRequired,
	"value": PropTypes.any
}

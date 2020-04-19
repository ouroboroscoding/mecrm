/**
 * Format Tree
 *
 * Handles top level Parents
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-04-10
 */

// NPM modules
import FormatOC from 'format-oc';
import PropTypes from 'prop-types';
import React from 'react';

// Material UI
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

// Format
import Parent from './Parent';

// Generic
import Events from '../../generic/events';
import Rest from '../../generic/rest';

// Local
import Utils from '../../utils';

// TreeComponent
export default class TreeComponent extends React.Component {

	constructor(props) {

		// Call parent
		super(props);

		// Get the display options
		let oReact = props.tree.special('react') || {};

		// If there's no primary, assume '_id'
		if(!('primary' in oReact)) {
			oReact.primary = '_id';
		}

		// Set the initial state
		this.state = {
			"key": ('value' in props && oReact.primary in props.value) ?
						props.value[oReact.primary] : null,
			"primary": oReact.primary,
			"name": props.tree._name,
			"type": props['type']
		}

		// Init the parent
		this.parent = null;

		// Bind methods
		this.insert = this.insert.bind(this);
		this.update = this.update.bind(this);
	}

	insert() {

		// Fetch the values from the parent
		let oValues = this.parent.value;

		// Make sure they're valid
		if(!this.props.tree.valid(oValues, false)) {
			Events.trigger('error', 'Please fix invalid data');
			this.parent.error(Utils.errorTree(this.props.tree.validation_failures));
			return;
		}

		// Send the data to the service via rest
		Rest.create(this.props.service,
					this.props.noun,
					oValues
		).done(res => {

			// If there's an error
			if(res.error && !Utils.restError(res.error)) {
				if(res.error.code === 1001) {
					this.parent.error(res.error.msg);
				} else if(res.error.code in this.props.errors) {
					Events.trigger('error', this.props.errors[res.error.code]);
				}
			}

			// If there's a warning
			if(res.warning) {
				Events.trigger('warning', JSON.stringify(res.warning));
			}

			// If there's data
			if(res.data) {

				// Show the popup
				Events.trigger('success', 'Created new ' + this.state.name);

				// If there's a success callback, call it with the returned data
				if(this.props.success) {
					this.props.success(res.data);
				}
			}
		});
	}

	render() {
		let title, submit, callback;
		if(this.state.type === 'insert') {
			title = 'Create ' + this.state.name;
			submit = 'Create';
			callback = this.insert;
		} else {
			title = 'Update ' + this.state.name;
			submit = 'Save';
			callback = this.update;
		}

		return (
			<Box className={"form _" + this.state.name}>
				<Typography variant="h5">{title}</Typography>
				<Parent
					ref={el => this.parent = el}
					name="user"
					parent={this.props.tree}
					type={this.state.type}
					value={this.props.value}
				/>
				<Box className="actions">
					{this.props.cancel &&
						<Button variant="contained" color="secondary" onClick={this.props.cancel}>Cancel</Button>
					}
					<Button variant="contained" color="primary" onClick={callback}>{submit}</Button>
				</Box>
			</Box>
		);
	}

	update() {

		// Fetch the values from the parent
		let oValues = this.parent.value;

		// Make sure they're valid
		if(!this.props.tree.valid(oValues, false)) {
			Events.trigger('error', 'Please fix invalid data');
			this.parent.error(Utils.errorTree(this.props.tree.validation_failures));
			return;
		}

		// Add the primary key
		oValues[this.state.primary] = this.state.key;

		// Send the data to the service via rest
		Rest.update(this.props.service,
					this.props.noun,
					oValues
		).done(res => {

			// If there's an error
			if(res.error && !Utils.restError(res.error)) {
				if(res.error.code === 1001) {
					this.parent.error(res.error.msg);
				} else if(res.error.code in this.props.errors) {
					Events.trigger('error', this.props.errors[res.error.code]);
				}
			}

			// If there's a warning
			if(res.warning) {
				Events.trigger('warning', JSON.stringify(res.warning));
			}

			// If there's data
			if(res.data) {

				// Show the popup
				Events.trigger('success', 'Saved ' + this.state.name);

				// If there's a success callback, call it with the returned data
				if(this.props.success) {
					this.props.success(res.data);
				}
			}
		});
	}
}

// Valid props
TreeComponent.propTypes = {
	"cancel": PropTypes.func,
	"errors": PropTypes.object,
	"noun": PropTypes.string.isRequired,
	"service": PropTypes.string.isRequired,
	"success": PropTypes.func,
	"tree": PropTypes.instanceOf(FormatOC.Tree).isRequired,
	"type": PropTypes.oneOf(['insert', 'update']).isRequired,
	"value": PropTypes.object
}

// Default props
TreeComponent.defaultProps = {
	"errors": {},
	"value": {}
}

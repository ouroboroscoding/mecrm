/**
 * Format Tree
 *
 * Handles
 *
 * @author Chris Nasr
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
import Loader from '../../loader';
import Utils from '../../utils';

// TreeComponent
export default class TreeComponent extends React.Component {

	constructor(props) {

		// Call parent
		super(props);

		// Get the display options
		let oDisplay = props.tree.special('react') || {};

		// If there's no primary, assume '_id'
		if(!('primary' in oDisplay)) {
			oDisplay.primary = '_id';
		}

		// Set the initial state
		this.state = {
			"name": props.tree._name,
			"type": (!('value' in props) || !(oDisplay.primary in props.value)) ?
					'insert' : 'update'
		}

		// If the type is insert make sure we have a proper insert prop
		if(this.state.type === 'insert') {
			if(!('insert' in props)) {
				throw new Error('Format/Tree requires insert prop if type is insert');
			}
			if(!('service' in props.insert) || !('noun' in props.insert)) {
				throw new Error('Format/Tree.insert requires both service and noun');
			}
		} else if(this.state.type === 'update') {
			if(!('update' in props)) {
				throw new Error('Format/Tree requires update prop if type is update');
			}
			if(!('service' in props.update) || !('noun' in props.update)) {
				throw new Error('Format/Tree.update requires both service and noun');
			}
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

		// Show the loader
		Loader.show();

		// Send the data to the service via rest
		Rest.create(this.props.insert.service,
					this.props.insert.noun,
					oValues
		).done(res => {

			// If there's an error
			if(res.error && !Utils.restError(res.error)) {
				if(res.error.code === 1001) {
					this.parent.errors(res.error.msg);
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
				Events.trigger('success', 'Created new ' + this.props.name);

				// If there's a success callback, call it with the returned data
				if(this.props.success) {
					this.props.success(res.data);
				}
			}

		}).always(() => {
			Loader.hide();
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

		// Show the loader
		Loader.show();

		// Send the data to the service via rest
		Rest.create(this.props.update.service,
					this.props.update.noun,
					oValues
		).done(res => {

			// If there's an error
			if(res.error && !Utils.restError(res.error)) {
				if(res.error.code === 1001) {
					this.parent.errors(res.error.msg);
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
				Events.trigger('success', 'Saved ' + this.props.name);

				// If there's a success callback, call it with the returned data
				if(this.props.success) {
					this.props.success(res.data);
				}
			}

		}).always(() => {
			Loader.hide();
		});
	}
}

// Valid props
TreeComponent.propTypes = {
	"cancel": PropTypes.func,
	"errors": PropTypes.object,
	"insert": PropTypes.object,
	"success": PropTypes.func,
	"tree": PropTypes.instanceOf(FormatOC.Tree).isRequired,
	"update": PropTypes.object,
	"value": PropTypes.object
}

// Default props
TreeComponent.defaultProps = {
	"errors": {},
	"value": {}
}

/**
 * Address
 *
 * Handles a single address
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-08-20
 */

// NPM modules
import PropTypes from 'prop-types';
import React from 'react';
import Tree from 'format-oc/Tree';

// Material UI
import Box from '@material-ui/core/Box'
import FormControl from '@material-ui/core/FormControl'
import Grid from '@material-ui/core/Grid'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'

// Format Component modules
import NodeComponent from '../format/Node';

// Generic modules
import Events from '../../generic/events';
import { empty, omap } from '../../generic/tools';

// Definition data
import AddressDef from '../../definitions/customers/address';

// Location data
import Countries from '../../definitions/countries';
import Divisions from '../../definitions/divisions';

// Address tree
const AddressTree = new Tree(AddressDef);

// Constant nodes
const oNodes = {
	'label': AddressTree.get('label'),
	'full_name': AddressTree.get('full_name'),
	'address1': AddressTree.get('address1'),
	'address2': AddressTree.get('address2'),
	'city': AddressTree.get('city'),
	'postalCode': AddressTree.get('postalCode')
}

// Address component
export default class Address extends React.Component {

	// Constructor
	constructor(props) {

		// Pass props to parent
		super(props);

		// Init state
		this.state = {
			"divisions": props.value.country in Divisions ? Divisions[props.value.country] : null
		}

		// Refs
		this.fields = {
			"full_name": null,
			"label": null,
			"address1": null,
			"address2": null,
			"city": null,
			"division": null,
			"country": null,
			"postalCode": null
		}

		// Bind methods
		this.countryChange = this.countryChange.bind(this);
		this.enterKey = this.enterKey.bind(this);
	}

	countryChange(ev) {
		this.setState({
			"divisions": this.fields['country'].value in Divisions ? Divisions[this.fields['country'].value] : null
		})
	}

	enterKey() {
		console.log('enter pressed');
	}

	error(errors) {
		for(var k in errors) {
			if(k in this.fields) {
				this.fields[k].error(errors[k]);
			} else {
				Events.trigger('error', 'Field not found error: ' + errors[k] + ' (' + k + ')');
			}
		}
	}

	// Render
	render() {
		return (
			<Grid container spacing={this.props.spacing || 2} className="AddressComposite">
				<Grid item xs={12} sm={6} lg={3}>
					<NodeComponent
						name="label"
						node={oNodes.label}
						onEnter={this.enterKey}
						ref={el => this.fields['label'] = el}
						value={this.props.value.label || null}
						validation={true}
					/>
				</Grid>
				<Grid item xs={12} sm={6} lg={3}>
					<NodeComponent
						name="full_name"
						node={oNodes.full_name}
						onEnter={this.enterKey}
						ref={el => this.fields['full_name'] = el}
						value={this.props.value.full_name || null}
						validation={true}
					/>
				</Grid>
				<Box component={Grid} item xs={false} sm={false} lg={6} display={{xs: 'none', sm: 'none', lg: 'block'}} />
				<Grid item xs={12} sm={6} lg={3}>
					<NodeComponent
						name="address1"
						node={oNodes.address1}
						onEnter={this.enterKey}
						ref={el => this.fields['address1'] = el}
						value={this.props.value.address1 || null}
						validation={true}
					/>
				</Grid>
				<Grid item xs={12} sm={6} lg={3}>
					<NodeComponent
						name="address2"
						node={oNodes.address2}
						onEnter={this.enterKey}
						ref={el => this.fields['address2'] = el}
						value={this.props.value.address2 || null}
						validation={true}
					/>
				</Grid>
				<Grid item xs={12} sm={6} lg={3}>
					<NodeComponent
						name="city"
						node={oNodes.city}
						onEnter={this.enterKey}
						ref={el => this.fields['city'] = el}
						value={this.props.value.city || null}
						validation={true}
					/>
				</Grid>
				{this.state.divisions &&
					<Grid item xs={12} sm={6} lg={3}>
						<FormControl variant="outlined">
							<InputLabel>State</InputLabel>
							<Select
								defaultValue={this.props.value.division || ''}
								label="State"
								native
								inputRef={el => this.fields['division'] = el}
							>
								{omap(this.state.divisions, (v,k) =>
									<option key={k} value={k}>{v}</option>
								)}
							</Select>
						</FormControl>
					</Grid>
				}
				<Grid item xs={12} sm={6} lg={3}>
					<FormControl variant="outlined">
						<InputLabel>Country</InputLabel>
						<Select
							defaultValue={this.props.value.country || ''}
							label="Country"
							native
							inputRef={el => this.fields['country'] = el}
							onChange={this.countryChange}
						>
							{omap(Countries, (v,k) =>
								<option key={k} value={k}>{v}</option>
							)}
						</Select>
					</FormControl>
				</Grid>
				<Grid item xs={12} sm={6} lg={3}>
					<NodeComponent
						name="postalCode"
						node={oNodes.postalCode}
						onEnter={this.enterKey}
						ref={el => this.fields['postalCode'] = el}
						value={this.props.value.postalCode || null}
						validation={true}
					/>
				</Grid>
			</Grid>
		);
	}

	get value() {

		// Init the return value
		let oRet = {};

		// Go through all the refs used
		for(let k in this.fields) {

			// Get the new value
			let newVal = this.fields[k].value;

			// If we're in update mode
			if(this.props.type === 'update') {

				// If the value is different
				if(this.props.value[k] !== newVal) {
					oRet[k] = newVal;
				}
			}

			// Else we're in insert or search mode
			else {

				// If the value isn't null, add it
				if(newVal !== null) {
					oRet[k] = newVal;
				}
			}
		}

		// If it's an update
		if(this.props.type === 'update') {

			// If it's empty
			if(empty(oRet)) {
				return false;
			}

			// Else, add the ID
			oRet['_id'] = this.props.value._id;
		}

		// Return the values
		return oRet;
	}

	set value(val) {
		for(let k in val) {
			this.fields[k].value = val[k];
		}
	}
}

// Valid props
Address.propTypes = {
	"type": PropTypes.oneOf(['create', 'update']).isRequired,
	"value": PropTypes.object
}

// Default props
Address.defaultProps = {
	"value": {}
}

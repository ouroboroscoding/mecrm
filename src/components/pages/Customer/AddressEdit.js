/**
 * Customer; Address Edit
 *
 * Handles adding new or editting existing address associated with a customer
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-09-05
 */

// NPM modules
import PropTypes from 'prop-types';
import React from 'react';

// Material UI
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Select from '@material-ui/core/Select';
import Tooltip from '@material-ui/core/Tooltip';

// Material UI Icons
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';

// Composite components
import Address from '../../composites/Address';

// Page components
import AddressDisplay from './AddressDisplay';

// Generic modules
import Events from '../../../generic/events';
import Rest from '../../../generic/rest';
import { afindo } from '../../../generic/tools';

// Local modules
import Utils from '../../../utils';

// AddressEdit component
export default class AddressEdit extends React.Component {

	constructor(props) {

		// Call parent
		super(props);

		// Init state
		this.state = {
			add: false,
			edit: false,
			value: props.value
		};

		// Init the field refs
		this.address = React.createRef();
		this.dropdown = React.createRef();

		// Bind methods
		this.addressAdd = this.addressAdd.bind(this);
		this.addressNew = this.addressNew.bind(this);
		this.addressEdit = this.addressEdit.bind(this);
		this.addressUpdate = this.addressUpdate.bind(this);
		this.dropdownChanged = this.dropdownChanged.bind(this);
	}

	addressAdd() {

		// Pull out the info
		let oAddress = this.address.current.value;

		// Add the customer ID and active state
		oAddress.customer = this.props.customer;
		oAddress.active = true;

		// Send it to the server
		Rest.create('customers', 'address', oAddress).done(res => {

			// If there's an error or warning
			if(res.error && !Utils.restError(res.error)) {
				// Invalid fields
				if(res.error.code === 1001) {
					this.address.current.error(res.error.msg);
				}
				// Unknown error
				else {
					Events.trigger('error', JSON.stringify(res.error));
				}
			}
			if(res.warning) {
				Events.trigger('warning', JSON.stringify(res.warning));
			}

			// If we got data
			if(res.data) {

				// Add the ID to the address
				oAddress._id = res.data;

				// Notify the parent
				this.props.onNew(oAddress);

				// Update the state
				this.setState({
					add: false,
					value: res.data
				});
			}
		});
	}

	addressNew() {
		this.setState({add: !this.state.add});
	}

	addressEdit() {
		if(this.state.edit) {
			this.setState({edit: false});
		} else {

			// Find the address being displayed
			let oAddress = afindo(this.props.addresses, '_id', this.dropdown.current.value);

			// Set the state
			this.setState({edit: oAddress});
		}
	}

	addressUpdate() {

		// Pull out the info
		let oAddress = this.address.current.value;

		// Send it to the server
		Rest.update('customers', 'address', oAddress).done(res => {

			// If there's an error or warning
			if(res.error && !Utils.restError(res.error)) {
				// Invalid fields
				if(res.error.code === 1001) {
					this.address.current.error(res.error.msg);
				}
				// Unknown error
				else {
					Events.trigger('error', JSON.stringify(res.error));
				}
			}
			if(res.warning) {
				Events.trigger('warning', JSON.stringify(res.warning));
			}

			// If we got data
			if('data' in res) {

				// Init the state object
				let oState = {edit: false};

				// If we got an edit
				if(res.data) {

					// If the address was replaced
					if(typeof res.data === 'object') {
						oState.value = res.data['new']['_id'];

						// Notify the parent
						this.props.onEdit(res.data);
					}

					// If the address was updated
					else {

						// Notify the parent
						this.props.onEdit(oAddress);
					}
				}

				// Update the state
				this.setState(oState);
			}
		});
	}

	dropdownChanged(ev) {
		this.setState({value: this.dropdown.current.value});
	}

	// Render
	render() {
		return (
			<React.Fragment>
				<Grid container spacing={2} className="addressEdit">
					<Grid item xs={10}>
						<Select
							inputRef={this.dropdown}
							native
							onChange={this.dropdownChanged}
							value={this.state.value}
							variant="outlined"
						>
							{this.props.addresses.map(o =>
								<option key={o._id} value={o._id}>{o.label}</option>
							)}
						</Select>
					</Grid>
					<Grid item xs={2}>
						<Tooltip title="Add Address">
							<IconButton onClick={this.addressNew}>
								<AddIcon />
							</IconButton>
						</Tooltip>
					</Grid>
					<Grid item xs={10} className="content">
						<AddressDisplay
							addresses={this.props.addresses}
							id={this.state.value}
						/>
					</Grid>
					<Grid item xs={2}>
						<Tooltip title="Add Address">
							<IconButton onClick={this.addressEdit}>
								<EditIcon />
							</IconButton>
						</Tooltip>
					</Grid>
				</Grid>
				{this.state.add &&
					<Dialog
						fullWidth={true}
						id="addressAdd"
						maxWidth="lg"
						onClose={this.addressNew}
						open={true}
						aria-labelledby="addressAdd-dialog-title"
					>
						<DialogTitle id="addressAdd-dialog-title">Add a customer address</DialogTitle>
						<DialogContent dividers>
							<Address
								ref={this.address}
								type="create"
								value={{
									label: "",
									full_name: "",
									address1: "",
									address2: "",
									city: "",
									division: "",
									country: "US",
									postalCode: ""
								}}
							/>
						</DialogContent>
						<DialogActions>
							<Button variant="contained" color="secondary" onClick={this.addressNew}>
								Cancel
							</Button>
							<Button variant="contained" color="primary" onClick={this.addressAdd}>
								Create Address
							</Button>
						</DialogActions>
					</Dialog>
				}
				{this.state.edit &&
					<Dialog
						fullWidth={true}
						id="addressEdit"
						maxWidth="lg"
						onClose={this.addressEdit}
						open={true}
						aria-labelledby="addressAdd-dialog-title"
					>
						<DialogTitle id="addressAdd-dialog-title">Edit existing customer address</DialogTitle>
						<DialogContent dividers>
							<Address
								ref={this.address}
								type="update"
								value={this.state.edit}
							/>
						</DialogContent>
						<DialogActions>
							<Button variant="contained" color="secondary" onClick={this.addressEdit}>
								Cancel
							</Button>
							<Button variant="contained" color="primary" onClick={this.addressUpdate}>
								Update Address
							</Button>
						</DialogActions>
					</Dialog>
				}
			</React.Fragment>
		);
	}

	get value() {
		return this.dropdown.current.value;
	}
}

// Valid props
AddressEdit.propTypes = {
	"customer": PropTypes.string.isRequired,
	"onEdit": PropTypes.func.isRequired,
	"onNew": PropTypes.func.isRequired
}

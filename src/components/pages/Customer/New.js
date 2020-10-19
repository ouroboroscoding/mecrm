/**
 * Customer New
 *
 * Handles getting data for creating a new customer
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-08-17
 */

// NPM modules
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import Tree from 'format-oc/Tree';
import { useHistory } from 'react-router-dom';

// Material UI
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Fab from '@material-ui/core/Fab';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

// Material UI Icons
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';

// Composite components modules
import Address from '../../composites/Address';

// Format modules
import Parent from '../../format/Parent';

// Generic modules
import Events from '../../../generic/events';
import Rest from '../../../generic/rest';
import { clone, uuidv4 } from '../../../generic/tools';

// Local modules
import Utils from '../../../utils';

// Definition data
import CustomerDef from '../../../definitions/customers/customer';

// Tree
const CustomerTree = new Tree(clone(CustomerDef));

// Individual addresses
class AddressOption extends React.Component {

	constructor(props) {

		// Pass props to parent
		super(props);

		// Init state
		this.state = {};

		// Refs
		this.ref = null;

		// Bind methods
		this.billingClick = this.billingClick.bind(this);
		this.shippingClick = this.shippingClick.bind(this);
	}

	billingClick(ev) {
		if(this.props.billing) {
			Events.trigger('error', 'To remove this as the billing address, select another address for billing.');
			return;
		}
		this.props.onBilling();
	}

	shippingClick(ev) {
		if(this.props.shipping) {
			Events.trigger('error', 'To remove this as the shipping address, select another address for shipping.');
			return;
		}
		this.props.onShipping();
	}

	render() {
		return (
			<Box className="addressOption">
				<Fab color="secondary" aria-label="add" className="floating" onClick={this.props.onRemove}>
					<CloseIcon />
				</Fab>
				<Grid container>
					<Grid item xs={12} sm={2}>
						<FormControlLabel
							control={<Checkbox checked={this.props.billing} onChange={this.billingClick} />}
							label="Billing"
						/>
						<FormControlLabel
							control={<Checkbox checked={this.props.shipping} onChange={this.shippingClick} />}
							label="Shipping"
						/>
					</Grid>
					<Grid item xs={12} sm={10}>
						<Address
							ref={el => this.ref = el}
							type="create"
							value={this.props.value}
						/>
					</Grid>
				</Grid>
			</Box>
		);
	}

	set billing(v) {
		this.setState({billing: v});
	}

	set shipping(v) {
		this.setState({shipping: v});
	}

	get child() {
		return this.ref;
	}
}

// Valid props
AddressOption.propTypes = {
	"billing": PropTypes.bool.isRequired,
	"onBilling": PropTypes.func.isRequired,
	"onRemove": PropTypes.func.isRequired,
	"onShipping": PropTypes.func.isRequired,
	"shipping": PropTypes.bool.isRequired,
	"value": PropTypes.object
}

// Default props
AddressOption.defaultProps = {
	"value": {}
}

// CustomerNew component
export default function CustomerNew(props) {

	// State
	let [addresses, addressesSet] = useState([{
		key: uuidv4(),
		billing: true,
		shipping: true
	}]);
	let [customer, customerSet] = useState(null);

	// Refs
	let addressRefs = useRef(addresses.reduce((r,o) => ({...r, [o.key]: React.createRef()}), {}));
	let customerRef = useRef();

	// Hooks
	let history = useHistory();

	// Add a new address form
	function addressAdd() {

		// Clone the addresses
		let lAddresses = clone(addresses);

		// Generate a new element
		let o = {
			key: uuidv4(),
			billing: false,
			shipping: false
		}

		// Add a new one
		lAddresses.push(o);

		// Update the refs
		addressRefs.current[o.key] = React.createRef();

		// Save state
		addressesSet(lAddresses);
	}

	// Submit the addresses to be created
	function addressesSubmit(customer, data) {

		// Addresses to remove
		let lRemove = [];
		let iCount = 0;

		// Go through each address we have
		for(let i = 0; i < data.length; ++i) {

			// Add the customer ID and active state
			data[i].customer = customer;
			data[i].active = true;

			// Send the request to the server
			// eslint-disable-next-line
			Rest.create('customers', 'address', data[i]).done(res => {

				// If there's an error or warning
				if(res.error && !Utils.restError(res.error)) {
					// Invalid fields
					if(res.error.code === 1001) {
						addressRefs.current[addresses[i].key].current.child.error(res.error.msg);
					}
					// Unknown error
					else {
						Events.trigger('error', JSON.stringify(res.error));
					}
				}
				if(res.warning) {
					Events.trigger('warning', JSON.stringify(res.warning));
				}

				// If we successfully created the user
				if(res.data) {

					// Init possible customer update
					let oCustomer = {
						_id: customer,
						billing: null,
						shipping: null
					};

					// If the address is for billing
					if(addresses[i].billing) {
						oCustomer.billing = res.data
					}

					// If the address is for shipping
					if(addresses[i].shipping) {
						oCustomer.shipping = res.data;
					}

					// If either billing or shipping is set
					if(oCustomer.billing || oCustomer.shipping) {

						// Update the customer
						Rest.update('customers', 'customer', oCustomer).done(res => {
							if(res.error && !Utils.restError(res.error)) {
								Events.trigger('error', JSON.stringify(res.error));
							}
							if(res.warning) {
								Events.trigger('warning', JSON.stringify(res.warning));
							}
						});
					}

					// Add the address to the removes
					lRemove.push(i);

					// Increment the count
					++iCount;

					// If the count matches the total
					if(data.length === iCount) {
						addressSubmitPost(customer, data, lRemove);
					}
				}
			});
		}
	}

	// Run after all addresses have been processed
	function addressSubmitPost(customer, data, remove) {

		// If the total remove matches the total addresses
		if(remove.length === data.length) {

			// Redirect to the customer page
			history.push('/customer/' + customer);
		}

		// Else, remove the ones that were successful so the user can focus on
		//	the ones that are not
		else {

			// Clone the addresses
			let lAddresses = clone(addresses);

			// Reverse loop
			for(let i = remove.length - 1; i > 0; --i) {
				lAddresses.splice(i, 1);
			}

			// Set state
			addressesSet(lAddresses);
		}
	}

	// Remove an address form
	function addressRemove(i) {

		// If we only have one address left
		if(addresses.length === 1) {
			Events.trigger('error', 'Must have at least one address');
			return;
		}

		// Clone the addresses
		let lAddresses = clone(addresses);

		// Is the billing/shipping checked
		let bBilling = lAddresses[i].billing;
		let bShipping = lAddresses[i].shipping;

		// Remove the address
		lAddresses.splice(i, 1);

		// If the billing was set
		if(bBilling) {
			lAddresses[0].billing = true;
		}

		// If the shipping was set
		if(bShipping) {
			lAddresses[0].shipping = true;
		}

		// Set the state
		addressesSet(lAddresses);
	}

	// Called when a billing/shipping checkbox is clicked within one of the
	//	AddressOption components
	function checkClick(type, index) {

		// Clone the addresses
		let lAddresses = clone(addresses);

		// Update the one that changed
		lAddresses[index][type] = true;

		// Go through each address
		for(let i = 0; i < lAddresses.length; ++i) {

			// If it's not the one clicked
			if(i !== index) {

				// If the value is true
				if(lAddresses[i][type]) {
					lAddresses[i][type] = false;
				}
			}
		}

		// Update the addresses
		addressesSet(lAddresses);
	}

	// Submit the customer for creation
	function submit() {

		// Clone the address data
		let lAddresses = addresses.map(o => {
			return clone(addressRefs.current[o.key].current.child.value)
		});

		// If we don't already have a customer ID
		if(customer === null) {

			// Get the form values
			let dData = customerRef.current.value;

			// Send the data to the server
			Rest.create('customers', 'customer', dData).done(res => {

				// If there's an error or warning
				if(res.error && !Utils.restError(res.error)) {
					// Invalid fields
					if(res.error.code === 1001) {
						customerRef.current.error(res.error.msg);
					}
					// Duplicate email
					else if(res.error.code === 2000) {
						Events.trigger('error', 'There is already a customer with the given e-mail address.');
						customerRef.current.error({
							"email": "duplicate"
						});
					}
					// Unknown error
					else {
						Events.trigger('error', JSON.stringify(res.error));
					}
				}
				if(res.warning) {
					Events.trigger('warning', JSON.stringify(res.warning));
				}

				// If we successfully created the user
				if(res.data) {

					// Create the addresses
					addressesSubmit(res.data, lAddresses);

					// Store the customer
					customerSet(res.data);
				}
			});
		}

		// Else, just process the addresses
		else {
			addressesSubmit(clone(customer), lAddresses);
		}
	}

	// Render
	return (
		<Box id="customer_new">
			<Typography variant="h3">Create New Customer</Typography>
			{customer === null &&
				<Box className="rounded">
					<Typography variant="h4">Primary Data</Typography>
					<Parent
						ref={customerRef}
						name="customer"
						onEnter={submit}
						parent={CustomerTree}
						type="create"
						value={{
							locale: 'en-US',
							comm_preference: 'sms',
							title: 'Mr.',
							phoneCode: '+1'
						}}
					/>
				</Box>
			}
			<Box className="rounded">
				<Typography variant="h4">Addresses</Typography>
				{addresses.map((o,i) =>
					<AddressOption
						billing={o.billing}
						key={o.key}
						onBilling={b => checkClick('billing', i, b)}
						onRemove={() => addressRemove(i)}
						onShipping={b => checkClick('shipping', i, b)}
						ref={addressRefs.current[o.key]}
						shipping={o.shipping}
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
				)}
				<Box className="actions">
					<Fab color="primary" className="addressAdd" onClick={addressAdd}>
						<AddIcon />
					</Fab>
				</Box>
			</Box>
			<Box className="actions">
				<Button variant="contained" color="primary" onClick={submit}>{customer ? 'Add Addresses' : 'Create Customer'}</Button>
			</Box>
		</Box>
	)
}

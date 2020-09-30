/**
 * Header
 *
 * Handles app bar and drawer
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-04-04
 */

// NPM modules
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import Tree from 'format-oc/Tree';

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

// Format modules
import Parent from '../format/Parent';

// Composite components modules
import Address from '../composites/Address';

// Generic modules
import Events from '../../generic/events';
//import Rest from '../../generic/rest';
import Tools from '../../generic/tools';

// Local modules
//import Utils from '../../utils';

// Definition data
import CustomerDef from '../../definitions/customers/customer';

// Tree
const CustomerTree = new Tree(CustomerDef);

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

// Header component
export default function CustomerNew(props) {

	// State
	let [addresses, addressesSet] = useState([{
		"key": Tools.uuidv4(),
		"billing": true,
		"shipping": true
	}]);
	let [custId, custIdSet] = useState(null);

	// Refs
	let lAddressRefs = [];
	let customerRef = useRef();

	function addressAdd() {

		// Clone the addresses
		let lAddresses = Tools.clone(addresses);

		// Add a new one
		lAddresses.push({
			"key": Tools.uuidv4(),
			"billing": false,
			"shipping": false
		});

		// Save state
		addressesSet(lAddresses);
	}

	function addressRemove(i) {

		// If we only have one address left
		if(addresses.length === 1) {
			Events.trigger('error', 'Must have at least one address');
			return;
		}

		// Clone the addresses
		let lAddresses = Tools.clone(addresses);

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

	function checkClick(type, index) {

		// Clone the addresses
		let lAddresses = Tools.clone(addresses);

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

	function submit() {

		// If we don't already have a customer ID
		if(custId === null) {

			// Send the data to the server
			Rest.create('customers', 'customer', )
		}

	}

	// Render
	return (
		<Box id="customer_new">
			<Typography variant="h3">Create New Customer</Typography>
			{custId === null &&
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
				<Button variant="contained" color="primary" onClick={submit}>{custId ? 'Add Addresses' : 'Create Customer'}</Button>
			</Box>
		</Box>
	)
}

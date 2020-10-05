/**
 * Customer
 *
 * Handles fetching an existing customer and displaying associated data
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-08-17
 */

// NPM modules
import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Tree from 'format-oc/Tree';

// Material UI
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

// Material UI Icons
import AddIcon from '@material-ui/icons/Add';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import EditIcon from '@material-ui/icons/Edit';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

// Composite components
import NoteAdd from '../composites/NoteAdd';

// Format modules
import Parent from '../format/Parent';

// Root components
import NotFound from '../NotFound';

// Page components
import AddressDisplay from './Customer/AddressDisplay';
import AddressEdit from './Customer/AddressEdit';

// Generic modules
import Clipboard from '../../generic/clipboard';
import Events from '../../generic/events';
import Rest from '../../generic/rest';
import { afindi, clone, combine, empty } from '../../generic/tools';

// Local modules
import Utils from '../../utils';

// Definition data
import CustomerDef from '../../definitions/customers/customer';

// Location data
import Locales from '../../definitions/locales';

// Tree
const CustomerTree = new Tree(CustomerDef);

// CustomerNew component
export default function Customer(props) {

	// State
	let [addresses, addressesSet] = useState(null);
	let [customer, customerSet] = useState(null);
	let [edit, editSet] = useState(false);
	let [noteAdd, noteAddSet] = useState(false);
	let [notes, notesSet] = useState(null);

	// Refs
	let billingRef = useRef();
	let customerRef = useRef();
	let shippingRef = useRef();

	// Hooks
	let { _id } = useParams();

	// Effects
	useEffect(() => {
		customerFetch();
		// eslint-disable-next-line
	}, [_id]);

	// Called when an address is editted
	function addressEdit(address) {

		// Init the possible index and replacement
		let iIndex = null;
		let oAddress = null;

		// If we got a replacement
		if(address.new && address.old) {

			// Find the old address
			iIndex = afindi(addresses, '_id', address.old._id);

			// Set the new address as the replacement
			oAddress = address.new;
		}

		// Else, we updated the existing
		else {

			// Find the address
			iIndex = afindi(addresses, '_id', address._id);

			// Combine the current address with the updates and set it as the
			//	replacement
			oAddress = combine(addresses[iIndex], address);
		}

		// If it's found
		if(iIndex > -1) {

			// Clone the addresses
			let lAddresses = clone(addresses);

			// Update the one found
			lAddresses[iIndex] = oAddress;

			// Update the state
			addressesSet(lAddresses);
		}
	}

	// Called when a new address is added
	function addressNew(address) {

		// Clone the addresses
		let lAddresses = clone(addresses);

		// Append the new address
		lAddresses.push(address);

		// Update the state
		addressesSet(lAddresses);
	}

	// Fetch the addresses based on the ID passed
	function addressesFetch(customer) {

		// Fetch the data from the server
		Rest.read('customers', 'customer/addresses', {
			customer: customer
		}).done(res => {

			// If there's an error or a warning
			if(res.error && !Utils.restError(res.error)) {
				Events.trigger('error', JSON.stringify(res.error));
			}
			if(res.warning) {
				Events.trigger('warning', JSON.stringify(res.warning));
			}

			// If we got data
			if(res.data) {
				addressesSet(res.data);
			}
		});
	}

	function copyKey() {

		// Copy the primary key to the clipboard then notify the user
		Clipboard.copy(customer._id).then(b => {
			Events.trigger('success', 'Customer ID copied to clipboard');
		});
	}

	function copyPhone() {

		// Copy the primary key to the clipboard then notify the user
		Clipboard.copy(customer.phoneCode + customer.phoneNumber).then(b => {
			Events.trigger('success', 'Customer Phone Number copied to clipboard');
		});
	}

	// Fetch the customer based on the ID passed
	function customerFetch() {

		// Fetch the data from the server
		Rest.read('customers', 'customer', {
			_id: _id
		}).done(res => {

			// If there's an error or a warning
			if(res.error && !Utils.restError(res.error)) {
				if(res.error.code === 1104) {
					customerSet(-1);
				} else {
					Events.trigger('error', JSON.stringify(res.error));
				}
			}
			if(res.warning) {
				Events.trigger('warning', JSON.stringify(res.warning));
			}

			// If we got data
			if(res.data) {
				customerSet(res.data);
				addressesFetch(res.data._id);
				notesFetch(res.data._id);
			}
		});
	}

	function noteAdded(note) {

		// Add the _created timestamp and user's name
		note._created = ~~(Date.now() / 1000);
		note.userName = props.user.firstName + ' ' + props.user.lastName;

		// Clone the current notes
		let lNotes = notes ? clone(notes) : [];

		// Append the new note
		lNotes.unshift(note);

		// Update the state
		noteAddSet(false);
		notesSet(lNotes);
	}

	function notesFetch(customer) {

		// Fetch the data from the server
		Rest.read('customers', 'customer/notes', {
			customer: customer
		}).done(res => {

			// If there's an error or a warning
			if(res.error && !Utils.restError(res.error)) {
				Events.trigger('error', JSON.stringify(res.error));
			}
			if(res.warning) {
				Events.trigger('warning', JSON.stringify(res.warning));
			}

			// If we got data
			if(res.data) {
				notesSet(res.data);
			}
		});
	}

	function update() {

		// Fetch the details
		let oCustomer = customerRef.current.value;

		// If the billing has changed
		if(billingRef.current.value !== customer.billing) {
			oCustomer.billing = billingRef.current.value;
		}

		// If the shipping changed
		if(shippingRef.current.value !== customer.shipping) {
			oCustomer.shipping = shippingRef.current.value;
		}

		// If nothing changed
		if(empty(oCustomer)) {
			Events.trigger('error', 'Nothing to save');
			return;
		}

		// Add the ID
		oCustomer._id = customer._id;

		// Send the changes to the server
		Rest.update('customers', 'customer', oCustomer).done(res => {

			// If there's an error or a warning
			if(res.error && !Utils.restError(res.error)) {
				Events.trigger('error', JSON.stringify(res.error));
			}
			if(res.warning) {
				Events.trigger('warning', JSON.stringify(res.warning));
			}

			// If we got data
			if(res.data) {

				// Set the state
				editSet(false);
				customerSet(combine(customer, oCustomer));
			}
		});
	}

	// Render
	return (
		<Box id="customer">
			{customer === -1 ?
				<NotFound />
			:
				<React.Fragment>
					{customer === null ?
						<Typography>Fetching details...</Typography>
					:
						<Grid container spacing={2}>
							<Grid item xs={12} md={8}>
								<Box className="rounded details">
									{edit ?
										<React.Fragment>
											<Typography variant="h4">Edit Customer Details</Typography>
											<Parent
												ref={customerRef}
												name="customer"
												onEnter={update}
												parent={CustomerTree}
												type="update"
												value={customer}
											/>
											<br />
											<Typography variant="h5">Addresses</Typography>
											<Grid container spacing={2}>
												<Grid item xs={12} md={6}>
													<Typography variant="h6">Billing</Typography>
													<AddressEdit
														addresses={addresses}
														customer={customer._id}
														onEdit={addressEdit}
														onNew={addressNew}
														ref={billingRef}
														value={customer.billing}
													/>
												</Grid>
												<Grid item xs={12} md={6}>
													<Typography variant="h6">Shipping</Typography>
													<AddressEdit
														addresses={addresses}
														customer={customer._id}
														onEdit={addressEdit}
														onNew={addressNew}
														ref={shippingRef}
														value={customer.shipping}
													/>
												</Grid>
											</Grid>
											<Box className="actions">
												<Button variant="contained" color="primary" onClick={update}>
													Save
												</Button>
											</Box>
										</React.Fragment>
									:
										<React.Fragment>
											<Box className="header">
												<Typography variant="h4" className="customerName">
													<nobr>{Utils.fullName(customer)}</nobr>
												</Typography>
												<Box className="copy">
													<Tooltip title="Copy Record Key">
														<IconButton onClick={copyKey}>
															<VpnKeyIcon />
														</IconButton>
													</Tooltip>
												</Box>
												<Box className="actions">
													<Tooltip title="Edit Customer">
														<IconButton onClick={e => editSet(true)}>
															<EditIcon />
														</IconButton>
													</Tooltip>
												</Box>
											</Box>
											<Grid container spacing={1}>
												<Grid item xs={12} md={4}>
													<Typography className="title">DOB</Typography>
													<p>{customer.dob}</p>
													<br />
													<Typography className="title">Contact</Typography>
													<p><span className="name">E-mail address: </span>{customer.email}</p>
													<p>
														<span className="name">Phone Number: </span>
														{customer.phoneCode} {Utils.nicePhone(customer.phoneNumber)}&nbsp;
														<Tooltip title="Copy Phone Number">
															<FileCopyIcon className="copy" onClick={copyPhone} />
														</Tooltip>
													</p>
													<br />
													<Typography className="title">Preferences</Typography>
													<p><span className="name">Locale: </span>{Locales[customer.locale]}</p>
													<p><span className="name">Communication: </span>{customer.comm_preference}</p>
												</Grid>
												<Grid item xs={12} md={4}>
													<Typography className="title">Billing</Typography>
													<AddressDisplay
														addresses={addresses}
														id={customer.billing}
													/>
												</Grid>
												<Grid item xs={12} md={4}>
													<Typography className="title">Shipping</Typography>
													<AddressDisplay
														addresses={addresses}
														id={customer.shipping}
													/>
												</Grid>
											</Grid>
										</React.Fragment>
									}
								</Box>
							</Grid>
							<Grid item xs={12} md={4}>
								<Box className="rounded">
									<Box className="header">
										<Typography variant="h6">Notes</Typography>
										<Box className="actions">
											<Tooltip title="Add Note">
												<IconButton onClick={e => noteAddSet(true)}>
													<AddIcon />
												</IconButton>
											</Tooltip>
										</Box>
									</Box>
									{notes === null ?
										<Typography>Loading...</Typography>
									:
										<React.Fragment>
											{notes.map(o =>
												<Box key={o._id} className="note">
													<Typography>
														<span className="user">{o.userName}: </span>
														<span className="date">{Utils.datetime(o._created)} </span>
													</Typography>
													<Typography className="content">{o.content}</Typography>
												</Box>
											)}
										</React.Fragment>
									}
								</Box>
							</Grid>
						</Grid>
					}
				</React.Fragment>
			}
			{noteAdd &&
				<NoteAdd
					customer={customer._id}
					onClose={() => noteAddSet(false)}
					onSubmit={noteAdded}
				/>
			}
		</Box>
	);
}

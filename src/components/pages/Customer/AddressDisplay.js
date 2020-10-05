/**
 * Customer: Address Display
 *
 * Handles displaying an address with only the data that's been filled
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-09-01
 */

// NPM modules
import PropTypes from 'prop-types';
import React from 'react';

// Material UI
import Box from '@material-ui/core/Box';

// Generic modules
import { afindo } from '../../../generic/tools';

// Location data
import Countries from '../../../definitions/countries';
import Divisions from '../../../definitions/divisions';

// AddressDisplay component
export default function AddressDisplay(props) {

	// Are the addresses not loaded yet
	if(props.addresses === null) {
		return <span>Loading...</span>
	}

	// Try to find the address in the list
	let o = afindo(props.addresses, '_id', props.id);

	// If it's not found
	if(!o) {
		return <span>Address not found</span>
	}

	// Set address2
	let sAddr2 = o.address2 ? ', ' + o.address2 : '';

	// Find the division if there is one
	let sDiv = o.division in Divisions[o.country] ? ', ' + Divisions[o.country][o.division] : '';

	// Render the address
	return (
		<Box className="addressDisplay">
			{o.full_name &&
				<p>{o.full_name}</p>
			}
			<p>{o.address1}{sAddr2}</p>
			<p>{o.city}{sDiv}</p>
			<p>{Countries[o.country]}, {o.postalCode}</p>
		</Box>
	);
}

AddressDisplay.propTypes = {
	id: PropTypes.string.isRequired
}

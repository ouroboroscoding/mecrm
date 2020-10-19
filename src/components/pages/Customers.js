/**
 * Customers
 *
 * Customers page
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-08-17
 */

// NPM modules
import Tree from 'format-oc/Tree'
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Material UI
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

// Material UI Icons
import PersonAddIcon from '@material-ui/icons/PersonAdd';

// Components
import ResultsComponent from '../format/Results';
import SearchComponent from '../format/Search';
import FormComponent from '../format/Form';

// Generic modules
import { clone } from '../../generic/tools';

// Definitions
import CustomerDef from '../../definitions/customers/customer';

// Generate the user Tree
const CustomerTree = new Tree(clone(CustomerDef));

/**
 * Customers
 *
 * Handles customer search
 *
 * @name Customers
 * @access public
 * @param Object props Properties passed to the component
 * @returns React.Component
 */
export default function Customers(props) {

	// State
	let [create, createSet] = useState(false);
	let [customers, customersSet] = useState([]);

	function createSuccess(user) {
		createSet(false);
		customersSet([user]);
	}

	function createToggle() {
		createSet(val => !val);
	}

	function search(customers) {
		customersSet(customers);
	}

	// Render
	return (
		<Box id="customers">
			<Box className="pageHeader">
				<Typography variant="h3" className="title">Customers</Typography>
				<Link to="/customer/new">
					<Tooltip title="Create new Customer">
						<IconButton onClick={createToggle}>
							<PersonAddIcon className="icon" />
						</IconButton>
					</Tooltip>
				</Link>
			</Box>
			<SearchComponent
				hash="customers"
				name="search"
				noun="search"
				service="customers"
				success={search}
				tree={CustomerTree}
			/>
			<ResultsComponent
				data={customers}
				noun="customer"
				orderBy=""name
				service="customers"
				tree={CustomerTree}
			/>
		</Box>
	);
}

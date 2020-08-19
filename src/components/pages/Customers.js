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
import React, { useRef, useState } from 'react';

// Material UI
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

// Material UI Icons
import HttpsIcon from '@material-ui/icons/Https';
import PersonAddIcon from '@material-ui/icons/PersonAdd';

// Components
import ResultsComponent from '../format/Results';
import SearchComponent from '../format/Search';
import FormComponent from '../format/Form';

// Generic modules
import Events from '../../generic/events';
import Rest from '../../generic/rest';
import Tools from '../../generic/tools';

// Local modules
import Utils from '../../utils';

// Definitions
import CustomerDef from '../../definitions/customers/customer';
import Divisions from '../../definitions/divisions';

// Generate the user Tree
const CustomerTree = new Tree(CustomerDef);

// Update the division (state) info
let oStateReact = CustomerTree.get('division').special('react');
oStateReact.options = Tools.omap(Divisions.US, (v,k) => [k, v]);
CustomerTree.get('division').special('react', oStateReact);

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
		<Box className="customers">
			<Box className="pageHeader">
				<Typography variant="h3" className="title">Customers</Typography>
				<Tooltip title="Create new Customer">
					<IconButton onClick={createToggle}>
						<PersonAddIcon className="icon" />
					</IconButton>
				</Tooltip>
			</Box>
			{create &&
				<Paper className="padded">
					<FormComponent
						cancel={createToggle}
						errors={{1200: "Email already in use", 1204: "Password not strong enough"}}
						noun="customer"
						service="customers"
						success={createSuccess}
						tree={CustomerTree}
						type="create"
					/>
				</Paper>
			}
			<SearchComponent
				hash="customers"
				noun="search"
				service="customers"
				success={search}
				tree={CustomerTree}
			/>
			<ResultsComponent
				data={customers}
				noun="user"
				orderBy=""name
				service="auth"
				tree={CustomerTree}
			/>
		</Box>
	);
}

/**
 * Products Medications
 *
 * Create, edit, and delete medications used for identifying products
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-10-07
 */

// NPM modules
import Tree from 'format-oc/Tree'
import React, { useState, useEffect } from 'react';

// Material UI
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

// Material UI Icons
import AddCircleIcon from '@material-ui/icons/AddCircle';

// Format Components
import ResultsComponent from '../../format/Results';
import FormComponent from '../../format/Form';

// Generic modules
import Events from '../../../generic/events';
import Rest from '../../../generic/rest';
import { afindi, clone } from '../../../generic/tools';

// Local modules
import Utils from '../../../utils';

// Definitions
import MedicationDef from '../../../definitions/products/medication';

// Trees
const MedicationTree = new Tree(MedicationDef);

// Medications component
export default function Medications(props) {

	// State
	let [medications, medicationsSet] = useState(null);
	let [create, createSet] = useState(false);

	// Effects
	useEffect(() => {

		// If we have a user
		if(props.user) {
			fetch();
		} else {
			medicationsSet(null);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.user]); // React to user changes

	function createSuccess(medication) {
		medicationsSet(medications => {
			let ret = clone(medications);
			ret.unshift(medication);
			return ret;
		});
		createSet(false);
	}

	// Toggle the create form
	function createToggle() {
		createSet(b => !b);
	}

	// Fetch all the medications from the server
	function fetch() {

		// Fetch all medications
		Rest.read('products', 'medications', {}).done(res => {

			// If there's an error or a warning
			if(res.error && !Utils.restError(res.error)) {
				Events.trigger('error', JSON.stringify(res.error));
			}
			if(res.warning) {
				Events.trigger('warning', JSON.stringify(res.warning));
			}

			// If there's data
			if(res.data) {

				// Set the medications
				medicationsSet(res.data);
			}
		});
	}

	// Remove a group
	function remove(_id) {

		// Use the current medications to set the new medications
		medicationsSet(medications => {

			// Clone the medications
			let ret = clone(medications);

			// Find the index
			let iIndex = afindi(ret, '_id', _id);

			// If one is found, remove it
			if(iIndex > -1) {
				ret.splice(iIndex, 1);
			}

			// Return the new medications
			return ret;
		});
	}

	return (
		<Box id="productsMedications">
			<Box className="pageHeader">
				<Typography variant="h4">Product Medications</Typography>
				{Utils.hasRight(props.user, 'products', 'create') &&
					<Tooltip title="Create new medication">
						<IconButton onClick={createToggle}>
							<AddCircleIcon />
						</IconButton>
					</Tooltip>
				}
			</Box>
			{create &&
				<Paper className="padded">
					<FormComponent
						cancel={createToggle}
						noun="medication"
						service="products"
						success={createSuccess}
						title="Create New"
						tree={MedicationTree}
						type="create"
					/>
				</Paper>
			}

			{medications === null ?
				<div>Loading...</div>
			:
				<ResultsComponent
					data={medications}
					noun="medication"
					orderBy="name"
					remove={Utils.hasRight(props.user, 'products', 'delete') ? remove : false}
					service="products"
					tree={MedicationTree}
					update={Utils.hasRight(props.user, 'products', 'update')}
				/>
			}
		</Box>
	);
}

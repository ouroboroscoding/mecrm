/**
 * Products Groups
 *
 * Create, edit, and delete groups used for sorting products
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
import GroupDef from '../../../definitions/products/group';

// Trees
const GroupTree = new Tree(GroupDef);

// Groups component
export default function Groups(props) {

	// State
	let [groups, groupsSet] = useState(null);
	let [create, createSet] = useState(false);

	// Effects
	useEffect(() => {

		// If we have a user
		if(props.user) {
			fetch();
		} else {
			groupsSet(null);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.user]); // React to user changes

	function createSuccess(group) {
		groupsSet(groups => {
			let ret = clone(groups);
			ret.unshift(group);
			return ret;
		});
		createSet(false);
	}

	// Toggle the create form
	function createToggle() {
		createSet(b => !b);
	}

	// Fetch all the groups from the server
	function fetch() {

		// Fetch all groups
		Rest.read('products', 'groups', {}).done(res => {

			// If there's an error or a warning
			if(res.error && !Utils.restError(res.error)) {
				Events.trigger('error', JSON.stringify(res.error));
			}
			if(res.warning) {
				Events.trigger('warning', JSON.stringify(res.warning));
			}

			// If there's data
			if(res.data) {

				// Set the groups
				groupsSet(res.data);
			}
		});
	}

	// Remove a group
	function remove(_id) {

		// Use the current groups to set the new groups
		groupsSet(groups => {

			// Clone the groups
			let ret = clone(groups);

			// Find the index
			let iIndex = afindi(ret, '_id', _id);

			// If one is found, remove it
			if(iIndex > -1) {
				ret.splice(iIndex, 1);
			}

			// Return the new groups
			return ret;
		});
	}

	return (
		<Box id="productsGroups">
			<Box className="pageHeader">
				<Typography variant="h4">Product Groups</Typography>
				{Utils.hasRight(props.user, 'products', 'create') &&
					<Tooltip title="Create new group">
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
						noun="group"
						service="products"
						success={createSuccess}
						title="Create New"
						tree={GroupTree}
						type="create"
					/>
				</Paper>
			}

			{groups === null ?
				<div>Loading...</div>
			:
				<ResultsComponent
					data={groups}
					noun="group"
					orderBy="name"
					remove={Utils.hasRight(props.user, 'products', 'delete') ? remove : false}
					service="products"
					tree={GroupTree}
					update={Utils.hasRight(props.user, 'products', 'update')}
				/>
			}
		</Box>
	);
}

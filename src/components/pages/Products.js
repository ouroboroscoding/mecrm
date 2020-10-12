/**
 * Products
 *
 * Products page
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-10-06
 */

// NPM modules
import Tree from 'format-oc/Tree'
import React, { useEffect, useState } from 'react';

// Material UI
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

// Material UI Icons
import AddCircleIcon from '@material-ui/icons/Add';

// Format Components
import ResultsComponent from '../format/Results';
import SearchComponent from '../format/Search';
import FormComponent from '../format/Form';
import { SelectData } from '../format/Shared';

// Generic modules
import Events from '../../generic/events';
import Rest from '../../generic/rest';
import { afindi, clone } from '../../generic/tools';

// Site modules
import Utils from '../../utils';

// Definitions
import ProductDef from '../../definitions/products/product';

// Add medication name
ProductDef['medication_name'] = {"__type__": "string", "__react__": {"title": "Medication"}}

// Add the dynamic select data for Group and Medication
ProductDef['group']['__react__'] = {
	options: new SelectData('products', 'groups'),
	title: 'Product Group',
	type: 'select'
};
ProductDef['medication']['__react__'] = {
	options: new SelectData('products', 'medications'),
	title: 'Medication (optional)',
	type: 'select'
};

// Generate the user Tree
const ProductTree = new Tree(ProductDef);

// Products component
export default function Products(props) {

	// State
	let [products, productsSet] = useState(null);
	let [create, createSet] = useState(false);

	// Effects
	useEffect(() => {

		// If we have a user
		if(props.user) {
			fetch();
		} else {
			productsSet(null);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.user]); // React to user changes

	function createSuccess(product) {
		productsSet(products => {
			let ret = clone(products);
			ret.unshift(product);
			return ret;
		});
		createSet(false);
	}

	// Toggle the create form
	function createToggle() {
		createSet(b => !b);
	}

	// Fetch all the products from the server
	function fetch() {

		// Fetch all products
		Rest.read('products', 'products', {}).done(res => {

			// If there's an error or a warning
			if(res.error && !Utils.restError(res.error)) {
				Events.trigger('error', JSON.stringify(res.error));
			}
			if(res.warning) {
				Events.trigger('warning', JSON.stringify(res.warning));
			}

			// If there's data
			if(res.data) {

				// Set the products
				productsSet(res.data);
			}
		});
	}

	// Remove a product
	function remove(_id) {

		// Use the current products to set the new products
		productsSet(products => {

			// Clone the products
			let ret = clone(products);

			// Find the index
			let iIndex = afindi(ret, '_id', _id);

			// If one is found, remove it
			if(iIndex > -1) {
				ret.splice(iIndex, 1);
			}

			// Return the new products
			return ret;
		});
	}

	// If we have any products
	let lGroups = null;
	if(products) {
		lGroups = [];
		let iIndex = -1;
		let sGroup = null

		// Go through each product
		for(let o of products) {

			// If the group changed
			if(sGroup !== o.group_name) {
				++iIndex;
				lGroups.push({name: o.group_name, products: []});
				sGroup = o.group_name;
			}

			// Add the product
			lGroups[iIndex]['products'].push(o);
		}
	}

	console.log(lGroups);

	// Render
	return (
		<Box id="products">
			<Box className="pageHeader">
				<Typography variant="h4">Products</Typography>
				{Utils.hasRight(props.user, 'products', 'create') &&
					<Tooltip title="Create new product">
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
						noun="product"
						service="products"
						success={createSuccess}
						title="Create New"
						tree={ProductTree}
						type="create"
					/>
				</Paper>
			}

			{lGroups === null ?
				<div>Loading...</div>
			:
				<React.Fragment>
					{lGroups.map(g =>
						<Paper className="productGroup">
							<Typography variant="h4">{g.name}</Typography>
							<ResultsComponent
								data={g.products}
								noun="product"
								orderBy="name"
								remove={Utils.hasRight(props.user, 'products', 'delete') ? remove : false}
								service="products"
								tree={ProductTree}
								update={Utils.hasRight(props.user, 'products', 'update')}
							/>
						</Paper>
					)}
				</React.Fragment>
			}
		</Box>
	);
}

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
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Material UI
import AppBar from '@material-ui/core/AppBar';
import Collapse from '@material-ui/core/Collapse';
import Drawer from '@material-ui/core/Drawer';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

// Material UI Icons
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import GroupIcon from '@material-ui/icons/Group';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import LocalPharmacyIcon from '@material-ui/icons/LocalPharmacy';
import MenuIcon from '@material-ui/icons/Menu';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import SearchIcon from '@material-ui/icons/Search';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';

// Generic modules
import Events from '../generic/events';
import Rest from '../generic/rest';
import { safeLocalStorageBool } from '../generic/tools';

// Local modules
import Utils from '../utils';

// Header component
export default function Header(props) {

	// State
	let [account, accountSet] = useState(false);
	let [customer, customerSet] = useState(safeLocalStorageBool('menuCustomer'));
	let [product, productSet] = useState(safeLocalStorageBool('menuProduct'));
	let [menu, menuSet] = useState(false);

	// Show/Hide menu
	function menuToggle() {
		menuSet(val => !val);
	}

	// Show/hide Customer sub-menu
	function customerMenuToggle() {
		customerSet(val => {
			localStorage.setItem('menuCustomer', val ? '' : 'x');
			return !val;
		});
	}

	// Show/hide Customer sub-menu
	function productMenuToggle() {
		productSet(val => {
			localStorage.setItem('menuProduct', val ? '' : 'x');
			return !val;
		});
	}

	// Signout of app
	function signout(ev) {

		// Call the signout
		Rest.create('auth', 'signout', {}).done(res => {

			// If there's an error
			if(res.error && !Utils.serviceError(res.error)) {
				Events.trigger('error', JSON.stringify(res.error));
			}

			// If there's a warning
			if(res.warning) {
				Events.trigger('warning', JSON.stringify(res.warning));
			}

			// If there's data
			if(res.data) {

				// Reset the session
				Rest.session(null);

				// Trigger the signedOut event
				Events.trigger('signedOut');
			}
		});
	}

	// Render
	return (
		<div id="header">
			<AppBar position="relative">
				<Toolbar>
					<IconButton edge="start" color="inherit" aria-label="menu" onClick={menuToggle}>
						<MenuIcon />
					</IconButton>
					<Typography className="title">
						<Link to="/">Citadel</Link>
					</Typography>
					{props.user &&
						<React.Fragment>
							<Tooltip title="Your Account">
								<IconButton onClick={ev => accountSet(true)}>
									<PermIdentityIcon />
								</IconButton>
							</Tooltip>
							<Tooltip title="Sign Out">
								<IconButton onClick={signout}>
									<ExitToAppIcon />
								</IconButton>
							</Tooltip>
						</React.Fragment>
					}
				</Toolbar>
			</AppBar>
			<Drawer
				anchor="left"
				id="menu"
				open={menu}
				onClose={menuToggle}
			>
				<List>
					<ListItem button key="Customers" onClick={customerMenuToggle}>
						<ListItemIcon><EmojiPeopleIcon /></ListItemIcon>
						<ListItemText primary="Customers" />
						{customer ? <ExpandLess /> : <ExpandMore />}
					</ListItem>
					<Collapse in={customer} timeout="auto" unmountOnExit>
						<List component="div" className="submenu">
							<Link to="/customers" onClick={menuToggle}>
								<ListItem button>
									<ListItemIcon><SearchIcon /></ListItemIcon>
									<ListItemText primary="Lookup" />
								</ListItem>
							</Link>
							<Link to="/customer/new" onClick={menuToggle}>
								<ListItem button>
									<ListItemIcon><PersonAddIcon /></ListItemIcon>
									<ListItemText primary="New" />
								</ListItem>
							</Link>
						</List>
					</Collapse>
					<ListItem button key="Products" onClick={productMenuToggle}>
						<ListItemIcon><ShoppingCartIcon /></ListItemIcon>
						<ListItemText primary="Products" />
						{customer ? <ExpandLess /> : <ExpandMore />}
					</ListItem>
					<Collapse in={product} timeout="auto" unmountOnExit>
						<List component="div" className="submenu">
							<Link to="/products/groups" onClick={menuToggle}>
								<ListItem button key="Groups">
									<ListItemIcon><GroupWorkIcon /></ListItemIcon>
									<ListItemText primary="Groups" />
								</ListItem>
							</Link>
							<Link to="/products/medications" onClick={menuToggle}>
								<ListItem button key="Medications">
									<ListItemIcon><LocalPharmacyIcon /></ListItemIcon>
									<ListItemText primary="Medications" />
								</ListItem>
							</Link>
							<Link to="/products" onClick={menuToggle}>
								<ListItem button key="Products">
									<ListItemIcon><ShoppingCartIcon /></ListItemIcon>
									<ListItemText primary="Products" />
								</ListItem>
							</Link>
						</List>
					</Collapse>
					<Link to="/users" onClick={menuToggle}>
						<ListItem button key="Users">
							<ListItemIcon><GroupIcon /></ListItemIcon>
							<ListItemText primary="Users" />
						</ListItem>
					</Link>
				</List>
			</Drawer>
			{account &&
				<div />
			}
		</div>
	);
}

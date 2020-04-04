/**
 * Header
 *
 * Handles app bar and drawer
 *
 * @author Chris Nasr
 * @copyright MaleExcelMedical
 * @created 2020-04-04
 */

// NPM Modules
import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

// app
class Header extends React.Component {

	constructor(props) {

		// Call the parent constructor
		super(props);

		// Initialise the state
		this.state = {}
	}

	render() {
		return (
			<div id="header">
				<AppBar position="static">
					<Toolbar>
						<IconButton edge="start" color="inherit" aria-label="menu">
							<MenuIcon />
						</IconButton>
						<Typography variant="h6" className="title">
							MeCRM
						</Typography>
						<Button color="inherit">Login</Button>
					</Toolbar>
				</AppBar>
			</div>
		);
	}
}

export default Header;

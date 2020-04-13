/**
 * Users
 *
 * Users page
 *
 * @author Chris Nasr
 * @copyright MaleExcelMedical
 * @created 2020-04-06
 */

// NPM modules
import React from 'react';

// Material UI
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

// Material UI Icons
import PersonAddIcon from '@material-ui/icons/PersonAdd';

// Generic modules
//import Events from '../generic/events';
//import Services from '../generic/services';

// Local modules
//import Loader from '../loader';
//import Utils from '../utils';

// Components
import User from '../composites/User'

// app
class Users extends React.Component {

	constructor(props) {

		// Call the parent constructor
		super(props);

		// Set initial state
		this.state = {
			"createNew": false,
			"query": {}
		}

		// Bind methods
		this.createToggle = this.createToggle.bind(this);
	}

	createToggle() {
		this.setState({"createNew": !this.state.createNew})
	}

	render() {
		return (
			<Box className="users">
				<Box className="pageHeader">
					<Typography variant="h3" className="title">Users</Typography>
					<PersonAddIcon className="icon fakeAnchor" onClick={this.createToggle} />
				</Box>
				{this.state.createNew &&
					<Paper>
						<User
							cancel={this.createToggle}
							success={this.createToggle}
						/>
					</Paper>
				}
				<Grid container spacing={3}>
				</Grid>
			</Box>
		);
	}
}

// Export component
export default Users;

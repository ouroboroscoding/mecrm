/**
 * Users
 *
 * Users page
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-04-06
 */

// NPM modules
import Tree from 'format-oc/Tree'
import React from 'react';

// Material UI
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
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

// Composites
import Permissions from '../composites/Permissions';

// Generic modules
import Events from '../../generic/events';
import Rest from '../../generic/rest';
import Tools from '../../generic/tools';

// Local modules
import Utils from '../../utils';

// Definitions
import UserDef from '../../definitions/auth/user';
import Divisions from '../../definitions/divisions';

// Generate the user Tree
const UserTree = new Tree(UserDef);

// Update the division (state) info
let oStateReact = UserTree.get('division').special('react');
oStateReact.options = Tools.omap(Divisions.US, (v,k) => [k, v]);
UserTree.get('division').special('react', oStateReact);

// app
class Users extends React.Component {

	constructor(props) {

		// Call the parent constructor
		super(props);

		// Set initial state
		this.state = {
			"createNew": false,
			"permissions": false,
			"users": []
		}

		// Init the refs
		this.permissions = null;
		this.results = null;

		// Bind methods
		this.createSuccess = this.createSuccess.bind(this);
		this.createToggle = this.createToggle.bind(this);
		this.permissionCancel = this.permissionCancel.bind(this);
		this.permissionsShow = this.permissionsShow.bind(this);
		this.permissionUpdate = this.permissionUpdate.bind(this);
		this.search = this.search.bind(this);
	}

	createSuccess(user) {
		this.setState({"createNew": false});
		this.results.data = [user];
	}

	createToggle() {
		this.setState({"createNew": !this.state.createNew})
	}

	permissionCancel() {
		this.setState({"permissions": false});
	}

	permissionsShow(user_id) {

		// Find the record by ID
		let oUser = Tools.afindo(this.state.users, '_id', user_id);

		// Update the state by adding the user ID and rights
		this.setState({
			"permissions": {
				"id": user_id,
				"rights": oUser.permissions
			}
		})
	}

	permissionUpdate() {

		// Fetch the data from the component
		let dPermissions = this.permissions.value;

		// Send the data to the server
		Rest.update('auth', 'permissions', {
			"user": this.state.permissions.id,
			"permissions": dPermissions
		}).then(res => {

			// If there's an error
			if(res.error && !Utils.restError(res.error)) {
				Events.trigger('error', JSON.stringify(res.error.msg));
			}

			// If there's a warning
			if(res.warning) {
				Events.trigger('warning', JSON.stringify(res.warning));
			}

			// If we were successful
			if(res.data) {

				// Notify
				Events.trigger('success', 'Updated permissions');

				// Hide the dialog
				this.setState({"permissions": false});
			}
		});
	}

	render() {
		return (
			<Box className="users">
				<Box className="pageHeader">
					<Typography variant="h3" className="title">Users</Typography>
					<Tooltip title="Create new User">
						<PersonAddIcon className="icon fakeAnchor" onClick={this.createToggle} />
					</Tooltip>
				</Box>
				{this.state.createNew &&
					<Paper className="padded">
						<FormComponent
							cancel={this.createToggle}
							errors={{1200: "Email already in use", 1204: "Password not strong enough"}}
							noun="user"
							service="auth"
							success={this.createSuccess}
							tree={UserTree}
							type="create"
						/>
					</Paper>
				}
				<SearchComponent
					noun="search"
					service="auth"
					success={this.search}
					tree={UserTree}
				/>
				<ResultsComponent
					actions={[
						{"tooltip": "Edit User's permissions", "icon": HttpsIcon, "callback": this.permissionsShow}
					]}
					data={this.state.users}
					noun="user"
					orderBy="email"
					ref={el => this.results = el}
					service="auth"
					tree={UserTree}
				/>
				{this.state.permissions &&
					<Dialog
						aria-labelledby="confirmation-dialog-title"
						maxWidth="lg"
						onClose={this.permissionCancel}
						open={true}
					>
						<DialogTitle id="permissions-dialog-title">Update Permissions</DialogTitle>
						<DialogContent dividers>
							<Permissions
								ref={el => this.permissions = el}
								user={this.state.permissions.id}
								value={this.state.permissions.rights}
							/>
						</DialogContent>
						<DialogActions>
							<Button variant="contained" color="secondary" onClick={this.permissionCancel}>
								Cancel
							</Button>
							<Button variant="contained" color="primary" onClick={this.permissionUpdate}>
								Update
							</Button>
						</DialogActions>
					</Dialog>
				}
			</Box>
		);
	}

	search(users) {
		this.setState({
			"users": users
		}, () => {
			this.results.data = users;
		});
	}
}

// Export component
export default Users;

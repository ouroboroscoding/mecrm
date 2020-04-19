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
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

// Material UI Icons
import PersonAddIcon from '@material-ui/icons/PersonAdd';

// Generic modules
import Tools from '../../generic/tools';

// Components
import ResultsComponent from '../format/Results';
import SearchComponent from '../format/Search';
import TreeComponent from '../format/Tree';

// Definitions
import UserDef from '../../definitions/auth/user';
import Divisions from '../../definitions/divisions';

// Generate the user Tree
const UserTree = new Tree(UserDef);

// Update the division (state) info
let oStateReact = UserTree.get('division').special('react');
oStateReact.options = Tools.omap(Divisions.US, (v,k) => [k, v]);
UserTree.get('division').special('react', oStateReact);

// Make passwd optional
UserTree.get('passwd').optional(true);

// app
class Users extends React.Component {

	constructor(props) {

		// Call the parent constructor
		super(props);

		// Set initial state
		this.state = {
			"createNew": false,
			"users": null
		}

		// Bind methods
		this.createToggle = this.createToggle.bind(this);
		this.results = this.results.bind(this);
	}

	createToggle() {
		this.setState({"createNew": !this.state.createNew})
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
						<TreeComponent
							cancel={this.createToggle}
							errors={{1200: "Email already in use", 1204: "Password not strong enough"}}
							noun="user"
							service="auth"
							success={this.createToggle}
							tree={UserTree}
							type="insert"
							value={{"locale": "en-US", "country": "US"}}
						/>
					</Paper>
				}
				<SearchComponent
					noun="search"
					service="auth"
					success={this.results}
					tree={UserTree}
				/>
				{this.state.users &&
					<ResultsComponent
						data={this.state.users}
						noun="user"
						orderBy="email"
						remove={true}
						service="auth"
						tree={UserTree}
					/>
				}
			</Box>
		);
	}

	results(users) {
		console.log(users);
		this.setState({"users": users});
	}
}

// Export component
export default Users;

/**
 * Permissions
 *
 * Handles permissions associated with a User
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-04-21
 */

// NPM modules
import PropTypes from 'prop-types';
import React from 'react';

// Material UI
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';

// defines
const CREATE = 4;
const READ   = 1;
const UPDATE = 2;
const DELETE = 8;
const TYPES = [
	{name: "user", title: "Users", allowed: CREATE | READ | UPDATE},
	{name: "permission", title: "User Permissions", allowed: UPDATE}
]

// Permission
class Permission extends React.Component {

	constructor(props) {

		// Call parent
		super(props);

		// Initial state
		this.state = {
			"value": props.value
		}

		// Bind methods
		this.change = this.change.bind(this);
	}

	change(event) {

		// Get the bit
		let bit = event.currentTarget.dataset.bit;

		console.log(bit);

		// Update the state
		this.setState({"value": this.state.value ^ bit}, state => {
			console.log(this.state.value);
		});
	}

	render() {
		return (
			<React.Fragment>
				<Grid item xs={4} className="name">{this.props.title}</Grid>
				{[CREATE, READ, UPDATE, DELETE].map(bit =>
					<Grid key={bit} item xs={2}>
						{this.props.allowed & bit ?
							<Switch
								checked={this.state.value & bit ? true : false}
								onChange={this.change}
								color="primary"
								inputProps={{
									"aria-label": 'primary checkbox',
									"data-bit": bit
								}}
							/>
						:
							''
						}
					</Grid>
				)}
			</React.Fragment>
		)
	}

	get value() {
		return this.state.value;
	}
}

// Force props
Permission.propTypes = {
	"allowed": PropTypes.number.isRequired,
	"title": PropTypes.string.isRequired,
	"value": PropTypes.number.isRequired
}

// Permissions
export default class Permissions extends React.Component {

	constructor(props) {

		// Call parent
		super(props);

		// Initial state
		this.state = {}

		// Init the refs
		this.children = {};
	}

	render() {
		return (
			<Grid container spacing={2} className="permissions">
				<Grid item xs={4} className="title"><span>Name</span></Grid>
				<Grid item xs={2} className="title"><span>Create</span></Grid>
				<Grid item xs={2} className="title"><span>Read</span></Grid>
				<Grid item xs={2} className="title"><span>Update</span></Grid>
				<Grid item xs={2} className="title"><span>Delete</span></Grid>
				{TYPES.map(perm =>
					<Permission
						allowed={perm.allowed}
						key={perm.name}
						ref={el => this.children[perm.name] = el}
						title={perm.title}
						value={this.props.value[perm.name] || 0}
					/>
				)}
			</Grid>
		);
	}

	get value() {

		// Init the data to return
		let dRet = {};

		// Go through each child
		for(let k in this.children) {

			// Get the rights
			let rights = this.children[k].value;

			// If it's non-zero, add it to the return
			if(rights) {
				dRet[k] = rights;
			}
		}

		// Return
		return dRet;
	}
}

// Force props
Permissions.propTypes = {
	"user": PropTypes.string.isRequired,
	"value": PropTypes.object
}

// Default props
Permissions.defaultTypes = {
	"value": {}
}

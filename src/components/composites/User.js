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
import PropTypes from 'prop-types';
import React from 'react';
import Tree from 'format-oc/Tree';

// Material UI
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
//import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

// Generic modules
//import Events from '../generic/events';
//import Services from '../generic/services';

// Local modules
//import Loader from '../loader';
//import Utils from '../utils';

// Components
import Parent from '../elements/format/Parent';

// Definitions
import UserDef from '../../definitions/auth/user';

// Generate the user Tree
const UserTree = new Tree(UserDef);

// app
export default class User extends React.Component {

	constructor(props) {

		// Call the parent constructor
		super(props);

		// Set initial state
		this.state = {
			"value": props.value || {}
		}

		// The parent element
		this.parent = null;

		// Bind methods to instance
		this.create = this.create.bind(this);
		this.update = this.update.bind(this);
	}

	create() {
		console.log(this.parent.value);
	}

	render() {
		let submit, text, type;

		// Some things are different based on whether an ID exists or not
		if(this.state.value._id) {
			submit = this.update;
			text = 'Update';
			type = 'update';
		} else {
			submit = this.create;
			text = 'Create';
			type = 'create';
		}

		return (
			<Box className="form user">
				<Typography variant="h5">{text} User</Typography>
				<Parent ref={el => this.parent = el} name="user" node={UserTree} type={type} value={this.state.value} />
				<Box className="actions">
					{this.props.cancel &&
						<Button variant="contained" color="secondary" onClick={this.props.cancel}>Cancel</Button>
					}
					<Button variant="contained" color="primary" onClick={submit}>{text}</Button>
				</Box>
			</Box>
		)
	}

	update() {

	}
}

// Force props
User.propTypes = {
	"cancel": PropTypes.func,
	"success": PropTypes.func
}

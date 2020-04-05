/**
 * Signin
 *
 * Handles sign in modal
 *
 * @author Chris Nasr
 * @copyright MaleExcelMedical
 * @created 2020-04-04
 */

// NPM modules
import React from 'react';

// Material UI
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';

// Generic modules
import Events from '../generic/events';
import Hash from '../generic/hash';
import Services from '../generic/services';

// Components
import Forms from './forms';

// Local modules
import Loader from '../loader';
import Utils from '../utils';

// app
class Signin extends React.Component {

	constructor(props) {

		// Call the parent constructor
		super(props);

		// Check for a forgot key
		var key = Hash.get('forgot');

		// Initialise the state
		this.state = {
			"forgot": key ? key : false,
			"form": key ? 'forgot' : 'signin'
		};

		// Init refs
		this.els = {};

		// Bind methods to this instance
		this.signin = this.signin.bind(this);
	}

	render() {
		return (
			<Dialog
				disableBackdropClick
				disableEscapeKeyDown
				maxWidth="lg"
				open={true}
				aria-labelledby="confirmation-dialog-title"
			>
				<DialogTitle id="confirmation-dialog-title">MeCRM</DialogTitle>
				{this.state.form === 'signin' &&
					<React.Fragment>
						<DialogContent dividers>
							<div><TextField inputRef={el => this.els.email = el} label="Email" /></div>
							<div><TextField inputRef={el => this.els.passwd = el} label="Password" type="password" /></div>
						</DialogContent>
						<DialogActions>
							<Button onClick={this.signin} color="primary">
								Sign In
							</Button>
						</DialogActions>
					</React.Fragment>
				}
				{this.state.form === 'forgot' &&
					<p>Forgot</p>
				}
			</Dialog>
		);
	}

	signin(ev) {

		// Show loader
		Loader.show();

		// Call the signin
		Services.create('auth', 'signin', {
			"email": this.els.email.value,
			"passwd": this.els.passwd.value
		}).done(res => {

			// If there's an error
			if(res.error && !Utils.serviceError(res.error)) {
				switch(res.error.code) {
					case 1001:
						// Go through each message and make the ref red
						for(var i in res.error.msg) {
							Forms.errorAdd(this.els[i]);
						}
						break;
					case 1201:
						Events.trigger('error', 'Alias or password invalid');
						break;
					default:
						Events.trigger('error', JSON.stringify(res.error));
						break;
				}
			}

			// If there's a warning
			if(res.warning) {
				Events.trigger('warning', JSON.stringify(res.warning));
			}

			// If there's data
			if(res.data) {

				// Set the session with the service
				Services.session(res.data.session);

				// Trigger the signedIn event
				Events.trigger('signedIn', res.data.user)
			}

		}).always(() => {
			// Hide loader
			Loader.hide();
		});
	}
}

export default Signin;

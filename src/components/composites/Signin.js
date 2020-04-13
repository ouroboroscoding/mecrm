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
import Events from '../../generic/events';
import Hash from '../../generic/hash';
import Services from '../../generic/services';

// Local modules
import Loader from '../../loader';
import Utils from '../../utils';

// Sign In
class Signin extends React.Component {

	constructor(props) {

		// Call the parent constructor
		super(props);

		// Check for a forgot key
		var key = Hash.get('forgot');

		// Initialise the state
		this.state = {
			"errors": {},
			"forgot": key ? key : false,
			"form": key ? 'forgot' : 'signin'
		};

		// Init refs
		this.fields = {};

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
							<div><TextField
								error={this.state.errors.email ? true : false}
								helperText={this.state.errors.email || ''}
								inputRef={el => this.fields.email = el}
								label="Email"
								type="email"
							/></div>
							<div><TextField
								error={this.state.errors.passwd ? true : false}
								helperText={this.state.errors.passwd || ''}
								inputRef={el => this.fields.passwd = el}
								label="Password"
								type="password"
							/></div>
						</DialogContent>
						<DialogActions>
							<Button variant="contained" color="primary" onClick={this.signin}>
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
			"email": this.fields.email.value,
			"passwd": this.fields.passwd.value
		}).done(res => {

			// If there's an error
			if(res.error && !Utils.serviceError(res.error)) {
				switch(res.error.code) {
					case 1001:
						// Go through each message and mark the error
						let errors = {};
						for(let i in res.error.msg) {
							errors[i] = res.error.msg[i];
						}
						this.setState({"errors": errors});
						break;
					case 1201:
						Events.trigger('error', 'Email or password invalid');
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
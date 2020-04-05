/**
 * Site
 *
 * Primary entry into React app
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-04-04
 */

// NPM modules
import React from 'react';

// Generic modules
import Events from './generic/events';
import Hash from './generic/hash';
import Services from './generic/services';

// Component modules
import Header from './components/header';
import Signin from './components/signin';

// Local modules
import Loader from './loader';

// css
import './sass/site.scss';

// Init the services
Services.init(process.env.REACT_APP_MEMS_DOMAIN, function(xhr) {

	// If we got a 401, let everyone know we signed out
	if(xhr.status === 401) {
		Events.trigger('error', 'You have been signed out!');
		Events.trigger('signedOut');
	}
});

// If we have a session, fetch the user
if(Services.session()) {
	Loader.show();
	Services.read('auth', 'session', {}).done(res => {
		Events.trigger('signedIn', res.data);
	}).always(() => {
		Loader.hide();
	});
}

// Hide the loader
Loader.hide();

// Make Events available from console
window.Events = Events;

// app
class Site extends React.Component {

	constructor(props) {

		// Call the parent constructor
		super(props);

		// Init the hash module and watch for org and page changes
		Hash.init();
		Hash.watch('page', this.pageHash.bind(this));

		// Track any signedIn/signedOut events
		Events.add('signedIn', this.signedIn.bind(this));
		Events.add('signedOut', this.signedOut.bind(this));

		// Initialise the state
		this.state = {
			"page": Hash.get('page', 'home'),
			"user": false
		};

		// Bind methods
		this.pageChange = this.pageChange.bind(this);
	}

	pageHash(page) {

		// If the page has changed
		if(page !== this.state.page) {
			this.setState({"page": page || "home"})
		}
	}

	pageChange(name) {
		Hash.set("page", name);
	}

	render() {
		return (
			<div className="site">
				{this.state.user === false &&
					<Signin />
				}
				<Header user={this.state.user} />
			</div>
		);
	}

	signedIn(user) {

		// Set the user
		this.setState({"user": user});
	}

	signedOut() {

		// Remove the user
		this.setState({"user": false});
	}
}

// Export the app
export default Site;

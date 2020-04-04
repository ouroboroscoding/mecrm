/**
 * App
 *
 * Primary entry into React app
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-04-04
 */

// NPM modules
import React from 'react';

// Local modules
import Events from './generic/events';
import Hash from './generic/hash';
import Loader from './generic/loader';
import Services from './generic/services';

// Components
import Header from './components/header';

// css
import './sass/site.scss';

// Init the services
Services.init(process.env.REACT_APP_MEMS_DOMAIN, function(xhr) {

	// If we got a 401, let everyone know we signed out
	if(xhr.status === 401) {
		Events.trigger('error', 'You have been signed out!');
		Events.trigger('signout');
	}
});

// If we have a session, fetch the user
if(Services.session()) {
	Loader.show();
	Services.read('auth', 'session', {}).done(res => {
		Events.trigger('signin', res.data);
	}).always(() => {
		Loader.hide();
	});
}

// Hide the loader
Loader.hide();

// Make Events available from console
window.Events = Events;

// app
class App extends React.Component {

	constructor(props) {

		// Call the parent constructor
		super(props);

		// Init the hash module and watch for org and page changes
		Hash.init();
		Hash.watch('page', this.pageHash.bind(this));

		// Track any signin/signout events
		Events.add('signin', this.signin.bind(this));
		Events.add('signout', this.signout.bind(this));

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
				<Header user={this.state.user} />
			</div>
		);
	}

	signin(thrower) {
		this.setState({"thrower": thrower});
	}

	signout() {

		// If the page needs to be signed in
		if([].indexOf(this.state.page) === -1) {
			Hash.set('page', null);
		}

		// Remove the thrower flag
		this.setState({"thrower": false});
	}
}

// Export the app
export default App;

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
import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

// Generic modules
import Events from '../generic/events';
import Hash from '../generic/hash';
import Rest from '../generic/rest';

// Hooks
import { useResize } from '../hooks/resize';
import { useSignedIn, useSignedOut } from '../hooks/user';

// Site component modules
import Alerts from './Alerts';
import Header from './Header';
import { LoaderHide, LoaderShow } from './Loader';
import Signin from './Signin';

// Page component modules
import Customer from './pages/Customer';
import CustomerNew from './pages/CustomerNew';
import Customers from './pages/Customers';
import Users from './pages/Users';

// CSS
import '../sass/site.scss';

// Init the rest services
Rest.init(process.env.REACT_APP_MEMS_DOMAIN, xhr => {

	// If we got a 401, let everyone know we signed out
	if(xhr.status === 401) {
		Events.trigger('error', 'You have been signed out!');
		Events.trigger('signedOut');
	} else {
		Events.trigger('error',
			'Unable to connect to ' + process.env.REACT_APP_MEMS_DOMAIN +
			': ' + xhr.statusText +
			' (' + xhr.status + ')');
	}
}, (method, url, data) => {
	LoaderShow();
}, (method, url, data) => {
	LoaderHide();
});

// If we have a session, fetch the user
if(Rest.session()) {
	Rest.read('auth', 'session', {}).done(res => {
		Rest.read('auth', 'user', {}).done(res => {
			Events.trigger('signedIn', res.data);
		});
	});
}

// Make Events available from console
window.Events = Events;

// Init the hash
Hash.init();

// Hide the loader
LoaderHide();

// Site
export default function Site(props) {

	// State
	let [mobile, mobileSet] = useState(document.documentElement.clientWidth < 600 ? true : false);
	let [user, userSet] = useState(false);

	// User hooks
	useSignedIn(user => userSet(user));
	useSignedOut(() => userSet(false));

	// Resize hooks
	useResize(() => mobileSet(document.documentElement.clientWidth < 600 ? true : false));

	// Render
	return (
		<SnackbarProvider maxSnack={3}>
			<Alerts />
			<div id="site">
				{user === false &&
					<Signin />
				}
				<Header
					mobile={mobile}
					user={user}
				/>
				<div id="content">
					<Switch>
						<Route path="/users">
							<Users />
						</Route>
						<Route path="/customers">
							<Customers />
						</Route>
						<Route path="/customer/new">
							<CustomerNew />
						</Route>
						<Route
							path="/customer/:id"
							component={({match: {params:{id}}}) => (
								<Customer
									key={id}
									_id={id}
									mobile={mobile}
									user={user}
								/>
							)}
						/>
					</Switch>
				</div>
			</div>
		</SnackbarProvider>
	);
}

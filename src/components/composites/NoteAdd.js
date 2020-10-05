/**
 * Note Add
 *
 * Displays a dialog to add a note and handles sending it off
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-10-03
 */

// NPM modules
import PropTypes from 'prop-types';
import React, { useRef } from 'react';

// Material UI modules
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';

// Generic modules
import Events from '../../generic/events';
import Rest from '../../generic/rest';

// Local modules
import Utils from '../../utils';

// Note Add component
export default function NoteAdd(props) {

	// Refs
	let contentRef = useRef();

	// Create new note
	function submit() {

		// Store the content
		let sContent = contentRef.current.value;

		// Send the request to the server
		Rest.create('customers', 'note', {
			customer: props.customer,
			content: sContent
		}).done(res => {

			// If there's an error or a warning
			if(res.error && !Utils.restError(res.error)) {
				Events.trigger('error', JSON.stringify(res.error));
			}
			if(res.warning) {
				Events.trigger('warning', JSON.stringify(res.warning));
			}

			// If we're ok
			if(res.data) {
				props.onSubmit({
					_id: res.data,
					content: sContent
				});
			}
		});
	}

	// Render
	return (
		<Dialog
			fullWidth={true}
			id="noteAdd"
			maxWidth="sm"
			onClose={props.onClose}
			open={true}
			aria-labelledby="noteAdd-dialog-title"
		>
			<DialogTitle id="noteAdd-dialog-title">Add a customer note</DialogTitle>
			<DialogContent dividers>
				<TextField
					label="Add Note"
					multiline
					inputRef={contentRef}
					rows="4"
					variant="outlined"
				/>
			</DialogContent>
			<DialogActions>
				<Button variant="contained" color="secondary" onClick={props.onClose}>
					Cancel
				</Button>
				<Button variant="contained" color="primary" onClick={submit}>
					Create Note
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// Valid props
NoteAdd.propTypes = {
	"customer": PropTypes.string.isRequired,
	"onClose": PropTypes.func.isRequired,
	"onSubmit": PropTypes.func.isRequired
}

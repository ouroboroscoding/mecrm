/**
 * Results
 *
 * Handles generating results
 *
 * @author Chris Nasr <bast@maleexcel.com>
 * @copyright MaleExcelMedical
 * @created 2020-04-18
 */

// NPM modules
import FormatOC from 'format-oc';
import PropTypes from 'prop-types';
import React from 'react';

// Material UI
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';

// Material UI icons
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

// Components
import Tree from './Tree';

// Generic modules
import Clipboard from '../../generic/clipboard';
import Events from '../../generic/events';
import Tools from '../../generic/tools';

class ResultsRowComponent extends React.Component {

	constructor(props) {

		// Call parent
		super(props);

		// Store the field order
		this.fields = props.fields;

		// Store rest info
		this.info = props.info;

		// Initial state
		this.state = {
			"data": props.data,
			"edit": false
		}

		// Bind methods
		this.copyKey = this.copyKey.bind(this);
		this.editToggle = this.editToggle.bind(this);
		this.remove = this.remove.bind(this);
	}

	copyKey() {

		// Copy the primary key to the clipboard then notify the user
		Clipboard.copy(this.state.data[this.info.primary]).then(b => {
			Events.trigger('success', 'Record key copied to clipboard');
		});
	}

	editToggle() {
		this.setState({"edit": !this.state.edit});
	}

	remove() {
		this.props.remove(this.state.data[this.info.primary]);
	}

	render() {

		let lCells = [];
		for(let i in this.fields) {
			lCells.push(
				<TableCell key={i}>
					{this.fields[i] === this.info.primary ? (
						<Tooltip title="Copy Record Key">
							<VpnKeyIcon className="fakeAnchor" onClick={this.copyKey} />
						</Tooltip>
					):
						this.state.data[this.fields[i]]
					}
				</TableCell>
			);
		}

		// Add the actions
		lCells.push(
			<TableCell key={-1} className="actions" align="right">
				<Tooltip title="Edit the record">
					<EditIcon className="fakeAnchor" onClick={this.editToggle} />
				</Tooltip>
				{this.props.remove &&
					<Tooltip title="Delete the record">
						<DeleteIcon className="fakeAnchor" onClick={this.remove} />
					</Tooltip>
				}
			</TableCell>
		);

		return (
			<React.Fragment>
				<TableRow>
					{lCells}
				</TableRow>
				{this.state.edit &&
					<TableRow>
						<TableCell colSpan={this.fields.length + 1}>
							<Tree
								cancel={this.editToggle}
								errors={{1200: "Email already in use", 1204: "Password not strong enough"}}
								noun={this.info.noun}
								service={this.info.service}
								success={this.editToggle}
								tree={this.info.tree}
								type="update"
								value={this.state.data}
							/>
						</TableCell>
					</TableRow>
				}
			</React.Fragment>
		);
	}
}

// Valid props
ResultsRowComponent.propTypes = {
	"data": PropTypes.object.isRequired,
	"fields": PropTypes.array.isRequired,
	"info": PropTypes.object.isRequired,
	"remove": PropTypes.oneOfType([PropTypes.func, PropTypes.bool]).isRequired
}

// ResultsComponent
export default class ResultsComponent extends React.Component {

	constructor(props) {

		// Call parent
		super(props);

		// Get the display options
		let oReact = props.tree.special('react') || {};

		// If there's no primary, assume '_id'
		if(!('primary' in oReact)) {
			oReact.primary = '_id';
		}

		// If we have the specific type
		if('results' in oReact) {
			this.fields = oReact['results'];
		}

		// Else, if we have the generic 'order'
		else if('order' in oReact) {
			this.fields = oReact['order'];
		}

		// Else, just use the keys
		else {
			this.fields = this.props.parent.keys();
		}

		// Generate the list of titles
		this.titles = [];
		for(let k of this.fields) {
			let oNode = props.tree.get(k).special('react');
			this.titles.push({
				"key": k,
				"text": ('title' in oNode) ? oNode.title : k
			});
		}

		// Store rest info
		this.info = {
			"noun": props.noun,
			"primary": oReact.primary,
			"service": props.service,
			"tree": props.tree
		}

		// Initial state
		this.state = {
			"data": props.data,
			"order": "desc",
			"orderBy": props.orderBy
		}

		// Bind methods
		this.orderChange = this.orderChange.bind(this);
		this.remove = this.remove.bind(this);
	}

	orderChange(event) {

		// Save the new orderBy
		let orderBy = event.currentTarget.dataset.key;
		let order = '';

		// If it hasn't actually changed, switch it, else use the order we have
		if(orderBy === this.state.orderBy) {
			order = this.state.order === 'asc' ? 'desc' : 'asc';
		} else {
			order = this.state.order;
		}

		// Save the new state
		this.setState({
			"order": order,
			"orderBy": orderBy
		});
	}

	remove(key) {
		console.log('remove: ' + key);
	}

	render() {
		return (
			<TableContainer className="results">
				<Table stickyHeader aria-label="sticky table">
					<TableHead>
						<TableRow>
							{this.titles.map(title => (
								<TableCell
									key={title.key}
									sortDirection={this.state.orderBy === title.key ? this.state.order : false}
								>
									<TableSortLabel
										active={this.state.orderBy === title.key}
										direction={this.state.orderBy === title.key ? this.state.order : 'asc'}
										data-key={title.key}
										onClick={this.orderChange}
									>
										{title.text}
									</TableSortLabel>
								</TableCell>
							))}
							<TableCell align="right" />
						</TableRow>
					</TableHead>
					<TableBody>
						{this.sort().map(row =>
							<ResultsRowComponent
								data={row}
								fields={this.fields}
								key={row[this.info.primary]}
								remove={this.props.remove ? this.remove : false}
								info={this.info}
							/>
						)}
					</TableBody>
				</Table>
			</TableContainer>
		);
	}

	sort() {

		// Make a copy of the rows
		let data = Tools.clone(this.props.data);

		// Sort it based on the order and orderBy
		data.sort((a,b) => {

			// If the values are the same
			if(a[this.state.orderBy] === b[this.state.orderBy]) {
				return 0;
			} else {
				if(a[this.state.orderBy] > b[this.state.orderBy]) {
					return this.state.order === 'asc' ? -1 : 1;
				} else {
					return this.state.order === 'asc' ? 1 : -1;
				}
			}
		});

		// Return the new data
		return data;
	}
}

// Valid props
ResultsComponent.propTypes = {
	"data": PropTypes.array.isRequired,
	"noun": PropTypes.string.isRequired,
	"orderBy": PropTypes.string.isRequired,
	"remove": PropTypes.bool,
	"service": PropTypes.string.isRequired,
	"tree": PropTypes.instanceOf(FormatOC.Tree).isRequired,
}

// Default props
ResultsComponent.defaultProps = {
	"remove": false
}

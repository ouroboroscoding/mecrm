/**
 * Format Parent
 *
 * Handles groups of FormatOC nodes
 *
 * @author Chris Nasr
 * @copyright MaleExcelMedical
 * @created 2020-04-10
 */

// NPM modules
import FormatOC from 'format-oc';
import PropTypes from 'prop-types';
import React from 'react';

// Material UI
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

// Format
import NodeComponent from './Node';

// ParentComponent
export default class ParentComponent extends React.Component {

	constructor(props) {

		// Call parent
		super(props);

		// Init state
		this.state = this.generateState();

		// Init the field refs
		this.fields = {};
	}

	error(errors) {
		for(var k in errors) {
			this.fields[k].error(errors[k]);
		}
	}

	generateState() {

		// Init the return
		let lElements = [];

		// Get the React special section if there is one
		let oReact = this.props.parent.special('react') || {};

		// Init the order
		let lOrder = null;

		// If we have the specific type
		if(this.props.type in oReact) {
			lOrder = oReact[this.props.type];
		}

		// Else, if we have the generic 'order'
		else if('order' in oReact) {
			lOrder = oReact['order'];
		}

		// Else, just use the keys
		else {
			lOrder = this.props.parent.keys();
		}

		// Go through each node
		for(let i in lOrder) {

			// Get the node
			let oChild = this.props.parent.get(lOrder[i]);

			// Check what kind of node it is
			switch(oChild.class()) {
				case 'Parent':
					lElements.push(
						<Grid key={i} item xs={12}>
							<ParentComponent
								ref={el => this.fields[lOrder[i]] = el}
								name={lOrder[i]}
								node={oChild}
								value={this.props.value[lOrder[i]] || {}}
							/>
						</Grid>
					);
					break;
				case 'Node':
					lElements.push(
						<Grid key={i} item xs={12} sm={6} lg={3}>
							<NodeComponent
								ref={el => this.fields[lOrder[i]] = el}
								name={lOrder[i]}
								node={oChild}
								value={this.props.value[lOrder[i]] || null}
							/>
						</Grid>
					);
					break;
				default:
					throw new Error('Invalid Node type in parent of child: ' + lOrder[i]);
			}
		}

		// Return the list of elements we generated
		return {
			"title": oReact.title || false,
			"elements": lElements
		};
	}

	render() {
		return (
			<Grid container spacing={2} className={"nodeParent _" + this.props.name}>
				{this.state.title &&
					<Typography variant="h6">{this.state.title}</Typography>
				}
				{this.state.elements}
			</Grid>
		);
	}

	get value() {
		let oRet = {};
		console.log(this.fields);
		for(let k in this.fields) {
			if(this.fields[k].value !== null) {
				oRet[k] = this.fields[k].value;
			}
		}
		return oRet;
	}

	set value(val) {
		for(let k in val) {
			this.fields[k].value = val[k];
		}
	}
}

// Valid props
ParentComponent.propTypes = {
	"name": PropTypes.string.isRequired,
	"parent": PropTypes.instanceOf(FormatOC.Parent).isRequired,
	"type": PropTypes.oneOf(['insert', 'update']).isRequired,
	"value": PropTypes.object
}

// Default props
ParentComponent.defaultProps = {
	"value": {}
}

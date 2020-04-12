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
import React from 'react';
import FormatOC from 'format-oc';
import PropTypes from 'prop-types';

// Material UI
import Box from '@material-ui/core/Box';

// Format
import Node from './Node';

// Parent
export default class Parent extends React.Component {

	constructor(props) {

		// Call parent
		super(props);

		// Init state
		this.state = {
			"elements": this.generate(),
			"value": props.value || {}
		}
	}

	generate() {

		// Init the return
		let lRet = [];

		// Get the React special section if there is one
		let oReact = this.props.node.special('react') || {};

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
			lOrder = this.props.node.keys();
		}

		// Go through each node
		for(let i in lOrder) {

			// Get the node
			let oChild = this.props.node.get(lOrder[i]);

			// Check what kind of node it is
			switch(oChild.class()) {
				case 'Parent':
					lRet.push(<Parent key={i} name={lOrder[i]} node={oChild} />);
					break;
				case 'Node':
					lRet.push(<Node key={i} name={lOrder[i]} node={oChild} />);
					break;
				default:
					throw new Error('Invalid Node type in parent of child: ' + lOrder[i]);
			}
		}

		// Return the list of elements we generated
		return lRet;
	}

	render() {
		return (
			<Box className={"nodeParent _" + this.props.name}>
				{this.state.elements}
			</Box>
		);
	}
}

// Force props
Parent.propTypes = {
	"name": PropTypes.string.isRequired,
	"node": PropTypes.instanceOf(FormatOC.Parent).isRequired,
	"type": PropTypes.oneOf(['create', 'update']),
	"value": PropTypes.object
}

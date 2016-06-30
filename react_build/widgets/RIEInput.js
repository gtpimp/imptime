import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import RIEEditBase from './RIEEditBase';
import { connect } from 'react-redux'

export class RIEInput extends RIEEditBase {
    
    constructor(props){
        super(props);
	this.onChange = this.onChange.bind(this)
    }

    onChange() {
	this.props.onChange(this.editField.value)
    }

    render() {
	const { value, onChange } = this.props
        return <input
	           ref={(ref) => this.editField = ref}
	           value={value}
		   onChange={this.onChange}
	       />
    }
}

function mapStateToProps(state, props) {
    return {
    }
}

export default connect(mapStateToProps)(RIEInput)

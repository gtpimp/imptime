import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom';
import Select from 'react-select';
import RIEEditBase from './RIEEditBase';
import { connect } from 'react-redux'

export class RIEDropDown extends RIEEditBase {

    constructor(props) {
        super(props)
	this.onChange = this.onChange.bind(this)
    }

    onChange() {
	const new_value = this.editField.value
	this.props.onChange(new_value)
	this.props.onSave(new_value)
    }
    
    render() {
	const { options, value, is_editing, is_readonly } = this.props

	return ( <div>Hi there</div> )
	
	return (
	    <div className="RIEDropDown">
		{ is_editing &&
		  <Select value={value}
			  ref={(ref) => this.editField = ref}
			  options={options}
			  onChange={this.onChange}
		  />		  
		}
		{ is_readonly &&
		  <span>{value}</span>
		}
	    </div>
	)
    };
}


function mapStateToProps(state, props) {
    return {
    }
}

export default connect(mapStateToProps)(RIEDropDown)


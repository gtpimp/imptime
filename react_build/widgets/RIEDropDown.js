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

    onChange(selected_option) {
	const new_value = selected_option.value
	this.props.onChange(new_value)
	this.props.onSave(new_value)
    }
    
    render() {
	const { options, value, is_editing, is_readonly } = this.props
	return (
	    <div>
		{ is_editing &&
		  <div className="RIEDropDown">
		      <Select value={value}
			      options={options}
			      onChange={this.onChange}
		      />
		  </div>
		}
		{ is_readonly &&
		  <span>{value}</span>
		}
	    </div>
	)
    }
}


function mapStateToProps(state, props) {
    return {
    }
}

export default connect(mapStateToProps)(RIEDropDown)


import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom';
import Select from 'react-select';
import RIEEditBase from './RIEEditBase';
import { connect } from 'react-redux'

export default class RIEDropDown extends RIEEditBase {

    constructor(props) {
        super(props)
	this.onChange = this.onChange.bind(this)
    }

    onChange() {
	this.props.onChange(this.editField.value)
    }
    
    render() {
	const { options, value } = this.props
	return (
	    <div className="RIEDropDown">
		<Select value={value}
			ref={(ref) => this.editField = ref}
			options={options}
			onChange={this.onChange}
		/>
	    </div>
	)
    };
}


function mapStateToProps(state, props) {
    return {
    }
}

export default connect(mapStateToProps)(RIEDropDown)


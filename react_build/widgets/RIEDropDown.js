import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom';
import RIEInput from './RIEInput'
import Select from 'react-select';
import TextareaAutosize from 'react-autosize-textarea'

export default class RIEDropDown extends RIEInput {

    constructor(props) {
        super(props)
	this.startEditing = this.startEditing.bind(this)
	this.stopEditing = this.stopEditing.bind(this)
	this.commit = this.commit.bind(this)
	this.state = {
            editing: false,
	}
    }

    selectInputText(inputElem) {
    };

    stopEditing() {
        this.setState({editing: false});
    };
    
    startEditing() {
        this.setState({editing: true});
    };

    commit(new_value) {
	let v = (new_value && new_value.value) || null
	this.stopEditing()
	const res = {}
	res[this.props.propName] = v
	this.props.change(res)
    };

    renderEditingComponent() {
	const { options, value } = this.props
	return (
	    <div className="RIEDropDown">
		<Select name='status'
			value={value}
			ref="input"
			autofocus={true}
			options={options}
			onChange={this.commit}
		/>
	    </div>
	)
    };

    render() {
        if(this.state.editing) {
            return this.renderEditingComponent();
        } else {
            return this.renderNormalComponent();
        }
    };
}

import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom';
import { RIEInput } from 'riek'
import TextareaAutosize from 'react-autosize-textarea'

export class RIETextArea extends Component {

    constructor(props) {
        super(props);
	this.startEditing = this.startEditing.bind(this)
	this.stopEditing = this.stopEditing.bind(this)
	this.commit = this.commit.bind(this)
	this.state = {
            editing: false,
	}
    }

    startEditing() {
        this.setState({editing: true});
    };

    commit() {
	let new_value = ReactDOM.findDOMNode(this.editor).value;
	this.stopEditing()
	const res = {}
	res[this.props.propName] = new_value
	this.props.change(res)
    };

    stopEditing() {
	this.setState({editing: false});
    };

    renderNormalComponent() {
        return <span
		   tabIndex="0"
		   onFocus={this.startEditing}
		   onClick={this.startEditing}>{(this.state.newValue || this.props.value)}</span>;
    };

    renderEditingComponent() {
	return <TextareaAutosize ref={(ref) => this.editor = ref} rows="20"  cols="80" defaultValue={this.props.value} onBlur={this.commit}/>;
    };

    render() {
        if(this.state.editing) {
            return this.renderEditingComponent();
        } else {
            return this.renderNormalComponent();
        }
    };
}

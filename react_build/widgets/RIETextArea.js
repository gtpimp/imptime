import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom';
import { RIEInput } from './RIEInput'
import TextareaAutosize from 'react-autosize-textarea'

export default class RIETextArea extends Component {

    constructor(props) {
        super(props);
	this.startEditing = this.startEditing.bind(this)
	this.stopEditing = this.stopEditing.bind(this)
	this.commit = this.commit.bind(this)
	this.cancel = this.cancel.bind(this)
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

    cancel() {
	this.stopEditing()
    }

    stopEditing() {
	this.setState({editing: false});
    };

    renderNormalComponent() {
        return (
	    <div>
		<pre>
	            {(this.state.newValue || this.props.value)}
		</pre>
		<br/>
		<button className="btn btn-secondary" onClick={this.startEditing}>Edit</button>
	    </div>
	)
	
    };

    renderEditingComponent() {
	return (
	    <div>
		<TextareaAutosize ref={(ref) => this.editor = ref} rows="20"  cols="80" defaultValue={this.props.value}/>
		<button className="btn btn-primary" onClick={this.commit}>Save</button>
		<button className="btn btn-cancel" onClick={this.cancel}>Cancel</button>
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

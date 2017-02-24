import React from 'react'
import ReactDOM from 'react-dom';
import RIEEditBase from './RIEEditBase';
import TextareaAutosize from 'react-autosize-textarea'

export default class RIETextArea extends RIEEditBase {

    constructor(props) {
        super(props);
	this.commit = this.commit.bind(this)
	this.cancel = this.cancel.bind(this)
	this.keyDown = this.keyDown.bind(this)
    }

    commit(event) {
	event.stopPropagation()
	let new_value = ReactDOM.findDOMNode(this.editor).value;
	this.props.onChange(new_value)
	this.props.onSave(new_value)
    }

    cancel(event) {
	event.stopPropagation()
	this.props.onCancel()
    }

    keyDown(event) {
	if ( event.keyCode === 13 ) {
	    event.stopPropagation()
	}
    }

    renderNormalComponent() {
        return (
	    <div>
		<pre>
	            {this.props.value}
		</pre>
		<br/>
		<button className="btn btn-secondary" onClick={this.props.startEditing}>
		    Edit
		</button>
	    </div>
	)
	
    }

    renderEditingComponent() {
	return (
	    <div>
		<TextareaAutosize
		    ref={(ref) => this.editor = ref}
		    rows="20"
		    cols="80"
		    onKeyDown={this.keyDown}
		    defaultValue={this.props.value}/>
		<button className="btn btn-primary" onClick={this.commit}>Save</button>
		<button className="btn btn-cancel" onClick={this.cancel}>Cancel</button>
	    </div>
	)
    }

    render() {
	const { is_editing, is_readonly } = this.props
	return (
	    <div>
		{ is_editing && this.renderEditingComponent() }
		{ is_readonly && this.renderNormalComponent() }
	    </div>
	)
    }

}

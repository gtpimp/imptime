import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom';
import {Editor, EditorState} from 'draft-js';
import { RIEInput } from 'riek'

export class RIETextArea extends Component {

    constructor(props) {
        super(props);
	this.state = {editorState: EditorState.createEmpty()};
	this.onChange = (editorState) => this.setState({editorState});
	this.startEditing = this.startEditing.bind(this)
	this.stopEditing = this.stopEditing.bind(this)
	this.commit = this.commit.bind(this)
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
	const {editorState} = this.state;
	return <textarea ref={(ref) => this.editor = ref} editorState={editorState} onBlur={this.commit} onChange={this.change} />;
	//return <Editor editorState={editorState} onBlur={this.stopEditing} onChange={this.change} />;
    };

    render() {
        if(this.state.editing) {
            return this.renderEditingComponent();
        } else {
            return this.renderNormalComponent();
        }
    };
}

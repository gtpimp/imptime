import React from 'react';
import ReactDOM from 'react-dom';
import RIEBase from './RIEBase';

export default class RIEStatefulBase extends RIEBase {
    constructor(props){
        super(props);
	this.doValidations = this.doValidations.bind(this)
	this.textChanged = this.textChanged.bind(this)
	this.startEditing = this.startEditing.bind(this)
	this.stopEditing = this.stopEditing.bind(this)
	this.finishEditing = this.finishEditing.bind(this)
	this.keyDown = this.keyDown.bind(this)
    }

    componentDidMount() {
	if ( this.props.initialState == 'editing' ) {
	    this.startEditing()
	}
    }

    startEditing() {
        this.setState({editing: true});
    };

    finishEditing() {
        let newValue = ReactDOM.findDOMNode(this.refs.input).value;
        this.doValidations(newValue);
        if(!this.state.invalid && this.props.value !== newValue) {
            this.commit(newValue);
        }
        this.stopEditing();
    };

    stopEditing() {
        this.setState({editing: false, invalid: false});
    }

    cancelEditing() {
	this.stopEditing()
	if ( this.props.cancel ) {
	    this.props.cancel()
	}
    };

    keyDown(event) {
        if(event.keyCode === 13) { this.finishEditing() }           // Enter
        else if (event.keyCode === 27) { this.cancelEditing() }     // Escape
    };

    textChanged(event) {
        this.doValidations(event.target.value.trim());
    };

    componentDidUpdate(prevProps, prevState) {
        var inputElem = ReactDOM.findDOMNode(this.refs.input);
        if (this.state.editing && !prevState.editing) {
            inputElem.focus();
            this.selectInputText(inputElem);
        } else if (this.state.editing && prevProps.text != this.props.text) {
            this.finishEditing();
        }
    };

    renderEditingComponent() {
        return <input
            disabled={this.state.loading}
            className={this.makeClassString()}
            defaultValue={this.props.value}
            onInput={this.textChanged}
            onBlur={this.finishEditing}
            ref="input"
            onKeyDown={this.keyDown} />;
    };

    renderNormalComponent() {
        return <span
            tabIndex="0"
            className={this.makeClassString()}
            onFocus={this.startEditing}
            onClick={this.startEditing}>{this.state.newValue || this.props.value}</span>;
    };

    elementBlur(event) {
        this.finishEditing();
    };

    elementClick(event) {
        this.startEditing();
        event.target.element.focus();
    };

    render() {
        if(this.state.editing) {
            return this.renderEditingComponent();
        } else {
            return this.renderNormalComponent();
        }
    };
}

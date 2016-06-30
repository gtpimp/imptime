import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import {
    startEditing,
    stopEditing,
    updateValue
} from '../actions/Rie'

export class RIEModeToggler extends React.Component {
    constructor(props){
        super(props);
	this.startEditing = this.startEditing.bind(this)
	this.cancelEditing = this.cancelEditing.bind(this)
	this.stopEditing = this.stopEditing.bind(this)
	this.finishEditing = this.finishEditing.bind(this)
	this.onChange = this.onChange.bind(this)
	this.keyDown = this.keyDown.bind(this)
    }

    componentDidMount() {
	if ( this.props.initialState == 'editing' ) {
	    this.startEditing()
	}
    }

    onChange(new_value) {
	const { dispatch, rie_key } = this.props
	dispatch(updateValue(rie_key, new_value))
    }

    finishEditing() {
	const { value } = this.props
	if ( this.props.onChange ) {
            this.onChange(value);
	}
        this.stopEditing();
    };

    startEditing() {
	const { dispatch, rie_key } = this.props
	dispatch(startEditing(rie_key))
    };

    stopEditing() {
	const { dispatch, rie_key } = this.props
	dispatch(stopEditing(rie_key))
    }

    cancelEditing() {
	const { dispatch, rie_key } = this.props
	dispatch(updateValue(rie_key, this.props.initialValue))
	this.stopEditing()
	if ( this.props.onCancel ) {
	    this.props.onCancel()
	}
    };

    keyDown(event) {
	const { is_editing } = this.props
	if ( ! is_editing ) {
	    return
	}
        if (event.keyCode === 13) {
	    event.preventDefault()
	    this.finishEditing()
	} else if (event.keyCode === 27) {
	    event.preventDefault()
	    this.cancelEditing()
	}
    };

    elementBlur(event) {
        this.finishEditing();
    };

    elementClick(event) {
        this.startEditing();
        event.target.element.focus();
    };

    renderNormalMode() {
	const { value } = this.props
        return (
	    <span onClick={this.startEditing}>
                {value}
	    </span>
	)
    };

    renderEditMode() {
	const { children, value } = this.props
	if ( ! children ) {
	    return (<div>No edit child provided</div>)
	}
	const that = this

	return React.Children.map(children, function(child, index) {
	    return React.cloneElement(child, {
		value: value,
		onChange: that.onChange
	    })
	})
    }
    
    render() {
	const { is_editing, is_readonly } = this.props

	return (
	    <div onKeyDown={this.keyDown}>
		{ is_editing && this.renderEditMode() }
		{ is_readonly && this.renderNormalMode() }
	    </div>
	)
    };
}

function mapStateToProps(state, props) {
    const { rie_key } = props

    const rie = state.rie || {}
    const r = rie[rie_key] || {}
    const mode = r.mode || 'readonly'
    const value = r.value || props.initialValue

    return {
	is_editing: mode == 'editing',
	is_readonly: mode == 'readonly',
	value: value
    }
}

export default connect(mapStateToProps)(RIEModeToggler)

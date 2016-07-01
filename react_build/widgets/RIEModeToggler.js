import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import {
    reset,
    setInitialValue,
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
	this.elementClick = this.elementClick.bind(this)
    }

    componentDidMount() {
	const { dispatch, rie_key } = this.props
	dispatch(setInitialValue(rie_key, this.props.initialValue))
	if ( this.props.initialState == 'editing' ) {
	    this.startEditing()
	}
    }

    componentWillUpdate() {
	const { dispatch, rie_key, initialValue, original_initial_value } = this.props
	if ( original_initial_value != initialValue ) {
	    dispatch(reset(rie_key))
	    dispatch(setInitialValue(rie_key, this.props.initialValue))
	}
    }

    onChange(new_value) {
	const { dispatch, rie_key } = this.props
	dispatch(updateValue(rie_key, new_value))
    }

    finishEditing(current_value) {
	let v = current_value || this.props.value
	if ( this.props.onChange ) {
            this.props.onChange(v);
	}
        this.stopEditing();
    };

    startEditing() {
	const { dispatch, rie_key, is_editing } = this.props
	if ( ! is_editing ) {
	    dispatch(startEditing(rie_key))
	}
    };

    stopEditing() {
	const { dispatch, rie_key, is_editing } = this.props
	if ( is_editing ) {
	    dispatch(stopEditing(rie_key))
	}
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
    };

    renderNormalMode() {
	const { value } = this.props
        return (
	    <span onClick={this.startEditing}>
                {value}
	    </span>
	)
    };

    render() {
	const { is_editing, is_readonly, children, value } = this.props

	const that = this
	return (
	    <div onKeyDown={this.keyDown} onClick={this.elementClick}>
		{ React.Children.map(children, function(child, index) {
		      return React.cloneElement(child, {
			  value: value,
			  is_editing: is_editing,
			  is_readonly: is_readonly,
			  startEditing: that.startEditing,
			  onChange: that.onChange,
			  onSave: that.finishEditing,
			  onCancel: that.cancelEditing
		      })
		  })
		}
	    </div>
	)
    }
}

function mapStateToProps(state, props) {
    const { rie_key } = props

    const rie = state.rie || {}
    const r = rie[rie_key] || {}
    const mode = r.mode || 'readonly'
    const value = r.value || props.initialValue
    const original_initial_value = r.initial_value

    return {
	is_editing: mode == 'editing',
	is_readonly: mode == 'readonly',
	value: value,
	original_initial_value: original_initial_value
    }
}

export default connect(mapStateToProps)(RIEModeToggler)

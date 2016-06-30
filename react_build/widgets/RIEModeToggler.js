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
	this.elementClick = this.elementClick.bind(this)
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
            this.props.onChange(value);
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
			  onChange: that.onChange
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

    return {
	is_editing: mode == 'editing',
	is_readonly: mode == 'readonly',
	value: value
    }
}

export default connect(mapStateToProps)(RIEModeToggler)

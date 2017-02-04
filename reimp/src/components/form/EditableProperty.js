import React, {Component} from 'react'
import {connect} from 'react-redux'
import Modal from 'react-modal';
import '../../sass/editable-property.scss'
import { isEditing, isReadonly, isEmpty, setEditing, setReadonly, setMode } from '../../actions/EditableProperty'

class EditableProperty extends Component {

    // The first child must be the editing component for the property
    // The (optional) second child must be the readonly component for the property
    // The (optional) third child must be the empty component for the property

    constructor(props) {
        super(props)
        this.startEditing = this.startEditing.bind(this)
        this.cancelEditing = this.cancelEditing.bind(this)
        this.keyDown = this.keyDown.bind(this)
        this.onEdited = this.onEdited.bind(this)
    }

    componentDidMount() {
        const {issue_id, property_key, dispatch} = this.props
        const initial_mode = this.props.initial_mode || 'read'
        dispatch(setMode(property_key, initial_mode))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, property_key, initial_mode} = this.props
        if ( new_props.initial_mode != initial_mode ) {
            dispatch(setMode(property_key, new_props.initial_mode))
        }
    }
    
    startEditing() {
        const { dispatch, property_key } = this.props
        dispatch(setEditing(property_key))
    }

    cancelEditing() {
        const { dispatch, property_key } = this.props
        dispatch(setReadonly(property_key))
    }
    
    keyDown(event) {
        const { is_editing } = this.props
	if ( ! is_editing ) {
	    return
	}
        if (event.keyCode === 27) {
	    event.preventDefault()
	    this.cancelEditing()
	}        
    }

    onEdited(new_value) {
        const { onChange } = this.props
        this.cancelEditing()
        onChange(new_value)
    }
    
    render() {

        const {children, initial_value, is_readonly, is_editing, is_empty, edit_as_modal} = this.props

	const that = this
	let editing_child = null
	let readonly_child = null
        let empty_child = null

	React.Children.map(children, function(child, index) {
	    if ( index === 0 ) {
		editing_child = React.cloneElement(child, {
		    initial_value: initial_value,
                    onChange: that.onEdited,
                    onKeyDown: that.keyDown
		})
	    } else if ( index === 1 ) {
		readonly_child = React.cloneElement(child, {
		    value: initial_value
		})
	    } else if ( index === 2 ) {
                empty_child = React.cloneElement(child, {
                    value: initial_value
                })
            }
	})
	if ( ! readonly_child ) {
	    readonly_child = editing_child
	}
        if ( ! empty_child ) {
            empty_child = readonly_child
        }
        
        return (
            <div className="property-stack-component">
                <div className="property-stack-component__content">
                    { is_editing && edit_as_modal &&
                      <Modal isOpen={true}
                             className="editable_property_modal"
                             overlayClassName="editable_property_modal--overlay"
                             onRequestClose={this.cancelEditing}
                             contentLabel="Tag editor">
                          {editing_child}
                      </Modal>
                    }
                    { is_editing && !edit_as_modal && editing_child}
                    { is_readonly && readonly_child }
                    { is_empty && empty_child }
                </div>
                <div className="property-stack-component__icons">
                    { (is_readonly || is_empty) && 
                      (
                          <div className="property-stack-component__icon" onClick={this.startEditing}>
                              <i className="material-icons">edit</i>
                          </div>
                      )
                    }
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { property_key, initial_value, edit_as_modal } = props
    
    return {
        property_key: property_key,
        initial_value: initial_value,
        edit_as_modal: edit_as_modal,
        is_editing: isEditing(state, property_key),
        is_readonly: isReadonly(state, property_key),
        is_empty: isEmpty(state, property_key)
    }
}

export default connect(mapStateToProps)(EditableProperty)

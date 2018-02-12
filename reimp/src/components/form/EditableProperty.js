import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import Modal from 'react-modal';
import '../../sass/editable-property.scss'
import { isEditing, isReadonly, isEmpty, setEditing, setReadonly, setMode, getMode } from '../../actions/EditableProperty'

class EditableProperty extends Component {n

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
        const {property_key, dispatch, mode} = this.props
        const initial_mode = this.props.initial_mode || 'read'
        if ( mode != initial_mode ) {
            dispatch(setMode(property_key, initial_mode))
        }
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, property_key} = this.props
        if ( new_props.mode === undefined || new_props.property_key != property_key ) {
            const initial_mode = new_props.initial_mode || 'read'
            if ( new_props.mode != initial_mode ) {
                dispatch(setMode(new_props.property_key, initial_mode))
            }
        }
    }

    startEditing(event) {
        const {dispatch, property_key, can_edit, is_editing} = this.props
        if ( is_editing ) {
            return
        }
        if ( event ) {
            event.stopPropagation()
        }
        if ( can_edit ) {
            dispatch(setEditing(property_key))
        }
    }

    cancelEditing(event) {
        const {dispatch, property_key, is_editing} = this.props
        if ( ! is_editing ) {
            return
        }
        if ( event ) {
            event.stopPropagation()
        }
        dispatch(setReadonly(property_key))
    }

    keyDown(event) {
        const {is_editing} = this.props

        if (!is_editing) {
            return
        }
        if (event.keyCode === 27) {
            event.preventDefault()
            this.cancelEditing()
        }
    }

    onEdited(new_value) {
        const {onChange, can_edit} = this.props
        this.cancelEditing()
        if (can_edit) {
            onChange(new_value)
        }
    }

    render() {

        const {children, initial_value, is_readonly, is_editing, is_empty,
               edit_as_modal, class_name, wideView, action_label} = this.props

        const that = this
        let editing_child = null
        let readonly_child = null
        let empty_child = null

        React.Children.map(children, function (child, index) {
            if (index === 0) {
                editing_child = React.cloneElement(child, {
                    initial_value: initial_value,
                    onSubmitted: that.onEdited,
                    onKeyDown: that.keyDown,
                    onCancel: that.cancelEditing
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
        if (!readonly_child) {
            readonly_child = editing_child
        }
        if (!empty_child) {
            empty_child = readonly_child
        }

        return (
            <div className={classNames(class_name, "editable-property")} onClick={this.startEditing}>
              <div>
                { is_editing && edit_as_modal &&
                  <Modal isOpen={true}
                         className={classNames("editable-property-modal",
                                               {"editable-property-modal--wide": wideView}) }
                         overlayClassName="editable-property-modal__overlay"
                         onRequestClose={this.cancelEditing}
                         contentLabel={action_label || ""}>
                    <div className="editable-property-modal__row editable-property-modal__row--header">
                      <label htmlFor="assigned" className="editable-property-modal__title">{this.props.actionLabel}</label>
                      <div className="editable-property-modal__close"><i className="material-icons" onClick={this.cancelEditing}>close</i></div>
                    </div>
                    <div className="editable-property-modal__content">
                      {editing_child}
                    </div>
                  </Modal>
                }
                { is_editing && !edit_as_modal && editing_child}
                { is_readonly && readonly_child }
                { is_empty && empty_child }
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const {property_key, initial_value, edit_as_modal, can_edit,
           class_name, wideView, action_label} = props

    return {
        property_key: property_key,
        initial_value: initial_value,
        edit_as_modal: edit_as_modal,
        can_edit: can_edit,
        is_editing: can_edit && isEditing(state, property_key),
        is_readonly: isReadonly(state, property_key),
        is_empty: !initial_value,
        class_name: class_name || "",
        wideView: wideView || false,
        action_label,
        mode: getMode(state, property_key)
    }
}

export default connect(mapStateToProps)(EditableProperty)

import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import ModalDialog from '../ModalDialog';
import '../../sass/editable-property.scss'
import { saveToLocalStorage } from '../../actions/LocalStorage';
import { isEditing, isReadonly, setEditing, setReadonly, setMode, getMode } from '../../actions/EditableProperty'

const MOUSE_MOVE_THRESHOLD = 5

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
        this.onMouseDown = this.onMouseDown.bind(this)
        this.stopEditing = this.stopEditing.bind(this)
        this.state = { mouse_pos_x: null,
                       mouse_pos_y: null }
    }

    componentDidMount() {
        const {property_key, dispatch, mode} = this.props
        const initial_mode = this.props.initial_mode || 'read'
        if ( mode !== initial_mode ) {
            dispatch(setMode(property_key, initial_mode))
        }
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, property_key} = this.props
        if ( new_props.mode === undefined || new_props.property_key !== property_key ) {
            const initial_mode = new_props.initial_mode || 'read'
            if ( new_props.mode !== initial_mode ) {
                dispatch(setMode(new_props.property_key, initial_mode))
            }
        }
    }

    onMouseDown(event) {
        this.setState({mouse_pos_x:event.clientX,
                       mouse_pos_y:event.clientY})
    }

    startEditing(event) {
        const {dispatch, property_key, can_edit, is_editing} = this.props
        if ( is_editing ) {
            return
        }
        const mouse_moved = Math.abs(this.state.mouse_pos_x-event.clientX) > MOUSE_MOVE_THRESHOLD ||
                            Math.abs(this.state.mouse_pos_y-event.clientY) > MOUSE_MOVE_THRESHOLD
        
        if ( can_edit && ! mouse_moved ) {
            dispatch(setEditing(property_key))
        }
        if ( event && ! mouse_moved ) {
            event.stopPropagation()
        }
    }

    stopEditing(event) {
        const { dispatch, property_key, is_editing } = this.props
        if ( ! is_editing ) {
            return
        }
        if ( event ) {
            event.preventDefault()
            event.stopPropagation()
        }
        dispatch(setReadonly(property_key))
    }

    cancelEditing(event) {
        const {is_editing} = this.props
        if ( ! is_editing ) {
            return
        }
        if ( event ) {
            event.preventDefault()
            event.stopPropagation()
        }
        if ( ! window.confirm("Are you sure you want to cancel?") ) {
            return false;
        }
        this.stopEditing()
    }

    keyDown(event) {
        
        const { property_key } = this.props

        saveToLocalStorage(property_key, event.target.value)

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
        this.stopEditing()
        if (can_edit) {
            onChange(new_value)
        }
    }

    render() {

        const {children, initial_value, is_readonly, is_editing, is_empty, can_edit,
               edit_as_modal, class_name, modal_variant, action_label} = this.props

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
                    onCancel: that.cancelEditing,
                    onClose: that.stopEditing
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
            <div className={classNames(class_name, "editable-property", {"editable-property--editable":can_edit})}
                 onMouseDown={this.onMouseDown}
                 onClick={this.startEditing}>
              <div>
                { is_editing && edit_as_modal &&
                  <ModalDialog isOpen={true}
                               variant={modal_variant}
                               onRequestClose={this.stopEditing}
                               contentLabel={action_label || ""}>
                    <div className="editable-property-modal__row editable-property-modal__row--header">
                      <label htmlFor="assigned" className="editable-property-modal__title">{this.props.actionLabel}</label>
                      <div className="editable-property-modal__close"><i className="material-icons" onClick={this.stopEditing}>close</i></div>
                    </div>
                    <div className="editable-property-modal__content">
                      {editing_child}
                    </div>
                  </ModalDialog>
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
           class_name, modal_variant, action_label} = props

    const is_editing = can_edit && isEditing(state, property_key)

    return {
        property_key,
        initial_value,
        edit_as_modal,
        can_edit,
        is_editing,
        is_readonly: isReadonly(state, property_key),
        is_empty: !is_editing && !initial_value && initial_value !== false,
        class_name: class_name || "",
        modal_variant,
        action_label,
        mode: getMode(state, property_key)
    }
}

export default connect(mapStateToProps)(EditableProperty)

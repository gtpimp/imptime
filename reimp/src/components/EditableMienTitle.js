import React, {Component} from 'react'
import {connect} from 'react-redux'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import classNames from 'classnames'
import EditableProperty from './form/EditableProperty'
import MienTitleForm from './form/MienTitleForm'
import { updateMienTitle, getMien } from '../actions/Miens'
import { has_permission } from '../actions/Users'

class EditableMienTitle extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, mien } = this.props
        dispatch(updateMienTitle(mien.id, new_value.title))
    }

    render() {
        const { mien, can_edit, project_id } = this.props

        return (
            <EditableProperty property_key={'mien_title'+mien.id}
                              initial_value={mien.title}
                              onChange={this.onChange}
                              can_edit={can_edit}
            >
              <MienTitleForm />
              <div className={classNames("text-component--readonly")}>
                {mien.title}
              </div>
              <div className="text-component--empty">Title</div>
            </EditableProperty>
        )
    }

}

function mapStateToProps(state, props) {
    const { mien_id } = props
    const mien = getMien(state, mien_id) || {}

    return {
        mien: mien,
        can_edit: true,
        project_id: mien.project_id
    }
}


export default connect(mapStateToProps)(EditableMienTitle)

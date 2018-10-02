import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import SprintNameForm from './form/SprintNameForm'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import { updateSprintName, getSprint } from '../actions/Sprints'
import { has_permission } from '../actions/Users'

class EditableSprintName extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, sprint } = this.props
        dispatch(updateSprintName(sprint.id, new_value.name))
    }

    render() {
        const { sprint, can_edit } = this.props

        return (
            <PermissionInspectorHighlighter project_id={sprint.project_id}
                                            permission_name='has_edit_sprint'>
              <EditableProperty property_key={'sprint_name'+sprint.id}
                                edit_as_modal={true}
                                variant="large"
                                initial_value={sprint.name}
                                onChange={this.onChange}
                                can_edit={can_edit}
                                actionLabel="Edit Sprint Name"
              >
                <SprintNameForm />
                <div className="text-component--readonly">{sprint.name}</div>
                <div className="text-component--empty">Name</div>
              </EditableProperty>
            </PermissionInspectorHighlighter>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id } = props
    const sprint = getSprint(state, sprint_id) || {}

    const can_edit = has_permission(state, sprint.project_id, 'has_edit_sprint')
    return {
        sprint: sprint,
        can_edit
    }
}


export default connect(mapStateToProps)(EditableSprintName)

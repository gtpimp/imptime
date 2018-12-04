import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import SprintDescriptionForm from './form/SprintDescriptionForm'
import { updateSprintDescription, getSprint } from '../actions/Sprints'
import { has_permission } from '../actions/Users'
import RenderedMarkdown from './RenderedMarkdown'

class EditableSprintDescription extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, sprint } = this.props

        dispatch(updateSprintDescription(sprint.id, new_value.description))
    }

    render() {
        const { sprint, can_edit, project_id } = this.props

        const description = (sprint.description || "").trim()
        const enriched_description = (sprint.enriched_description || "").trim() || description
        
        return (
            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_description'>
              <EditableProperty property_key={'sprint_description'+sprint.id}
                                initial_value={description}
                                onChange={this.onChange}
                                can_edit={can_edit}
              >
                <SprintDescriptionForm />
                <div className="text-component--readonly text-component--description">
                  <RenderedMarkdown content={enriched_description} />
                </div>
                <div> </div>
              </EditableProperty>
            </PermissionInspectorHighlighter>
        )
    }

}

function mapStateToProps(state, props) {
    const { sprint_id } = props
    const sprint = getSprint(state, sprint_id) || {}
    const can_edit = has_permission(state, sprint.project_id, 'has_edit_description')
    return {
        sprint: sprint,
        project_id: sprint.project_id,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableSprintDescription)

import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import { updateProjectArchived, getProject } from '../actions/Projects'
import { has_permission } from '../actions/Users'
import ProjectArchivedForm from './form/ProjectArchivedForm'

class EditableProjectArchived extends Component {

    onChange = (archived) => {
        const { dispatch, project_id } = this.props
        dispatch(updateProjectArchived(project_id, archived))
    }

    render() {
        const { project, can_edit } = this.props

        return (
            <PermissionInspectorHighlighter project_id={project.id}
                                            permission_name='has_edit_project_detail'>
              <EditableProperty property_key={'project_archived_'+project.id}
                                initial_value={project.archived}
                                onChange={this.onChange}
                                can_edit={can_edit}
              >
                <ProjectArchivedForm />
                <div>
                  State:
                  { project.archived && "Archived" }
                  { !project.archived && "Active" }
                </div>
              </EditableProperty>
            </PermissionInspectorHighlighter>
        )
    }

}

function mapStateToProps(state, props) {
    const { project_id } = props
    const project = getProject(state, project_id) || {}
    const can_edit = has_permission(state, project.id, 'has_edit_project_detail')
    return {
        project: project,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableProjectArchived)

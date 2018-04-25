import React, {Component} from 'react'
import {connect} from 'react-redux'
import { has_permission } from '../actions/Users'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import EditableProperty from './form/EditableProperty'
import ProjectNameForm from './form/ProjectNameForm'
import { updateProjectName, getProject } from '../actions/Projects'

class EditableProjectName extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, project } = this.props
        dispatch(updateProjectName(project.id, new_value.name))
    }

    render() {
        const { project, can_edit } = this.props
        
        return (
            <PermissionInspectorHighlighter project_id={project.id}
                                            permission_name='has_edit_project_detail'>
              <EditableProperty property_key={'project_name'+project.id}
                                initial_value={project.name}
                                onChange={this.onChange}
                                edit_as_modal={true}
                                can_edit={can_edit}
              >
                <ProjectNameForm />
                <div className="text-component--readonly">{project.name}</div>
                <div className="text-component--empty">Name</div>
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


export default connect(mapStateToProps)(EditableProjectName)

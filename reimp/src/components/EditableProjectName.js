import React, {Component} from 'react'
import {connect} from 'react-redux'
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
        const { project } = this.props
        
        return (
            <EditableProperty property_key={'project_name'+project.id}
                              initial_value={project.name}
                              onChange={this.onChange}
                              edit_as_modal={true}
            >
                <ProjectNameForm />
                <div className="text-component--readonly">{project.name}</div>
                <div className="text-component--empty">Name</div>
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id } = props
    const project = getProject(state, project_id) || {}
    return {
        project: project
    }
}


export default connect(mapStateToProps)(EditableProjectName)

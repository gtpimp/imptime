import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import ProjectDescriptionForm from './form/ProjectDescriptionForm'
import { updateProjectDescription, getProject } from '../actions/Projects'
import { has_permission } from '../actions/Users'
import Blank from './form/Blank'
import ReactMarkdown from 'react-markdown'

const renderers = {
    link: (props) => {
        return (
          <a href={props.href}
             target="_blank"
             onClick={(event) => event.stopPropagation()}>
             {(props.children && props.children[0]) || props.href}
          </a> 
        )
    }
}

class EditableProjectDescription extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, project_id } = this.props

        dispatch(updateProjectDescription(project_id, new_value.description))
    }

    render() {
        const { project, can_edit } = this.props

        const description = (project.description || "").trim()
        
        return (
            <EditableProperty property_key={'project_description'+project.id}
                              initial_value={description}
                              onChange={this.onChange}
                              can_edit={can_edit}
            >
              <ProjectDescriptionForm />
              <div className="text-component--readonly text-component--description">
                <ReactMarkdown source={description} renderers={renderers} />
              </div>
              <div className="text-component--empty text-component--description">
                ...
              </div>
            </EditableProperty>
        )
    }

}

function mapStateToProps(state, props) {
    const { project_id } = props
    const project = getProject(state, project_id) || {}
    const can_edit = has_permission(state, project.id, 'has_edit_description')
    return {
        project: project,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableProjectDescription)

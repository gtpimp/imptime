import { updateProjectDescription, getProject } from '../actions/Projects'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {has_permission} from '../actions/Users.js'

class DeleteProject extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, project_id } = this.props

        dispatch(updateProjectDescription(project_id, new_value.description))
    }
    
    render() {

        const { onDelete, project } = this.props
        return (
            <div className="timer-switch">
              <button className="button button--default button--timer button--start-timer" onClick={onDelete}>
                <div className="button__text">
                  Delete Project
                </div>
              </button>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project = getProject(state, project.id) || {}
    const { project_id } = props
    const can_delete_project = has_permission(state, project_id, 'has_delete_project')
    return {
        project: project,
        can_delete_project: can_delete_project
    }
}
export default connect(mapStateToProps)(DeleteProject)

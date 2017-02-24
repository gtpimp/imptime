import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form'
import EditableProperty from './form/EditableProperty'
import SprintStatusForm from './form/SprintStatusForm'
import SprintStatusLabel from './form/SprintStatusLabel'
import Blank from './form/Blank'
import { updateSprintStatus, getSprints } from '../actions/Sprints'
import OtherUser from '../components/OtherUser'
import { getUser } from '../actions/Users'

class EditableSprintStatus extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, sprint_ids } = this.props
        console.log(new_value)
        dispatch(updateSprintStatus(sprint_ids, new_value.sprint_status_name))
    }
    render() {
        const { sprint, project_id } = this.props
        
        return (
            <div>
                <EditableProperty property_key='sprint_status_name'
                                  initial_value={sprint && sprint.status_name || null}
                                  edit_as_modal={true}
                                  onChange={this.onChange}
                >
                    <SprintStatusForm project_id={project_id}/>
                    <SprintStatusLabel />
                    <Blank />
                </EditableProperty>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_ids } = props
    const sprints = getSprints(state, sprint_ids) || []
    const sprint = sprints && sprints.length > 0 && sprints[0]
    const project_id = sprint.project_id
    
    return {
        sprints: sprints,
        sprint: sprint,
        project_id: project_id
    }
}

export default connect(mapStateToProps)(EditableSprintStatus)

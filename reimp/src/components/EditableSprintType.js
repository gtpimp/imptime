import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form'
import EditableProperty from './form/EditableProperty'
import SprintTypeForm from './form/SprintTypeForm'
import Blank from './form/Blank'
import { updateSprintType, getSprints } from '../actions/Sprints'
import OtherUser from '../components/OtherUser'
import { getUser } from '../actions/Users'
import { has_permission } from '../actions/Users'

class EditableSprintType extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, sprint_ids } = this.props
        dispatch(updateSprintType(sprint_ids, new_value.sprint_type_name))
    }

    render() {
        const { sprint, project_id, can_edit, class_name } = this.props
        
        return (
            <EditableProperty property_key={'sprint_type_name'+sprint.id}
                              initial_value={sprint && sprint.type_name || null}
                              edit_as_modal={true}
                              class_name={class_name}
                              can_edit={can_edit}
                              onChange={this.onChange}
                              actionLabel="Sprint Type"
            >
                <SprintTypeForm project_id={project_id}/>
                <div>{sprint.sprint_type}</div>
                <Blank />
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_ids, class_name } = props
    const sprints = getSprints(state, sprint_ids) || []
    const sprint = sprints && sprints.length > 0 && sprints[0]
    const project_id = sprint.project_id
    const can_edit = has_permission(state, sprint.project_id, 'has_edit_sprint_type')
    
    return {
        sprints: sprints,
        sprint: sprint,
        project_id: project_id,
        can_edit,
        class_name
    }
}

export default connect(mapStateToProps)(EditableSprintType)

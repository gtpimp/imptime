import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import SprintNameForm from './form/SprintNameForm'
import { updateSprintName, getSprint } from '../actions/Sprints'

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
        const { sprint } = this.props
        
        return (
            <EditableProperty property_key='sprint_name'
                              initial_value={sprint.name}
                              onChange={this.onChange}
            >
                <SprintNameForm />
                <div className="text-component--readonly">{sprint.name}</div>
                <div className="text-component--empty">Name</div>
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id } = props
    const sprint = getSprint(state, sprint_id) || {}
    return {
        sprint: sprint
    }
}


export default connect(mapStateToProps)(EditableSprintName)

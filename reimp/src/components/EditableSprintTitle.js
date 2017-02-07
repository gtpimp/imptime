import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import SprintTitleForm from './form/SprintTitleForm'
import { updateSprintSubject, getSprint } from '../actions/Sprints'

class EditableSprintTitle extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, sprint } = this.props
        dispatch(updateSprintSubject(sprint.id, new_value.title))
    }

    render() {
        const { sprint } = this.props
        
        return (
            <EditableProperty property_key='sprint_title'
                              initial_value={sprint.subject}
                              onChange={this.onChange}
            >
                <SprintTitleForm />
                <div className="text-component--readonly">{sprint.subject}</div>
                <div className="text-component--empty">Title</div>
            </EditableProperty>
        )
    }

}

function mapStateToProps(state, props) {
    const { sprint_id } = props
    const sprint = getSprint(state, sprint_id)
    return {
        sprint: sprint
    }
}


export default connect(mapStateToProps)(EditableSprintTitle)

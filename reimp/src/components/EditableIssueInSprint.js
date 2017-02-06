import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import SelectSprintForm from './form/SelectSprintForm'
import SprintLabel from './form/SprintLabel'
import Blank from './form/Blank'
import { moveIssuesToSprint } from '../actions/Issue'
import { getIssues } from '../actions/Issues'

class EditableIssueInSprint extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue_ids } = this.props
        dispatch(moveIssuesToSprint(issue_ids, new_value.sprint_id))
    }
    
    render() {
        const { sprint_id, project_id } = this.props
        
        return (
            <div>
                <EditableProperty property_key='issue_sprint_id'
                                  initial_value={sprint_id}
                                  edit_as_modal={true}
                                  onChange={this.onChange}
                >
                    <SelectSprintForm project_id={project_id} />
                    <SprintLabel />
                    <Blank />
                </EditableProperty>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue_ids } = props
    const issues = getIssues(state, issue_ids) || []
    const project_id = issues && issues.length > 0 && issues[0].project_id
    const sprint_id = issues && issues.length > 0 && issues[0].sprint_id
    
    return {
        issues: issues,
        project_id: project_id,
        sprint_id: sprint_id
    }
}


export default connect(mapStateToProps)(EditableIssueInSprint)

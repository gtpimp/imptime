import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import SelectSprintForm from './form/SelectSprintForm'
import SprintLabel from './form/SprintLabel'
import Blank from './form/Blank'
import { moveIssuesToSprint, getIssues } from '../actions/Issues'
import { has_permission } from '../actions/Users'

class EditableIssueInSprint extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue } = this.props
        dispatch(moveIssuesToSprint(issue.id, new_value.sprint_id))
    }

    render() {
        const { sprint_id, project_id, can_edit } = this.props

        return (
            <div>
                <EditableProperty property_key='issue_sprint_id'
                                  initial_value={sprint_id}
                                  edit_as_modal={true}
                                  onChange={this.onChange}
                                  actionLabel="Move to Sprint"
                                  can_edit={can_edit}
                >
                    <SelectSprintForm project_id={project_id} />
                    <SprintLabel />
                    <Blank/>
                </EditableProperty>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue_ids } = props

    const issue = getIssues(state, issue_ids) || []
    const project_id = issue && issue.length > 0 && issue[0].project_id
    const sprint_id = issue && issue.length > 0 && issue[0].sprint_id
    const can_edit = has_permission(state, issue.project_id, 'has_edit_subject')

    return {
        issues: issue,
        project_id: project_id,
        sprint_id: sprint_id,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableIssueInSprint)

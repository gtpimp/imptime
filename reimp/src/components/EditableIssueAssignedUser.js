import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import IssueAssignedUserForm from './form/IssueAssignedUserForm'
import Blank from './form/Blank'
import { updateIssueAssignedTo, getIssues } from '../actions/Issues'
import OtherUser from '../components/OtherUser'
import { has_permission } from '../actions/Users'

class EditableIssueAssignedUser extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue_ids } = this.props
        dispatch(updateIssueAssignedTo(issue_ids, new_value.assigned_user))
    }

    render() {
        const { project_id, issue, can_edit} = this.props

        return (
            <div>
                <EditableProperty property_key='issue_assigned_to'
                                  initial_value={issue && issue.assigned_to_id || null}
                                  edit_as_modal={true}
                                  onChange={this.onChange}
                                  actionLabel="Assign to"
                                  can_edit={can_edit}
                >
                    <IssueAssignedUserForm project_id={project_id}/>
                    <OtherUser />
                    <div className="text-component--empty">Unassigned</div>
                </EditableProperty>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue_ids } = props
    const issues = getIssues(state, issue_ids) || []
    const issue = issues && issues.length > 0 && issues[0]
    const project_id = issue.project_id
    const can_edit = has_permission(state, issue.project_id, 'has_edit_subject')

    return {
        issues: issues,
        issue: issue,
        project_id: project_id,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableIssueAssignedUser)

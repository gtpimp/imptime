import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import IssueAssignedUserForm from './form/IssueAssignedUserForm'
import { updateIssueAssignedTo } from '../actions/Issues'
import OtherUser from '../components/OtherUser'
import { has_permission } from '../actions/Users'
import { makeSelGetIssues, makeSelGetSampleIssue } from '../selectors/IssueSelectors'

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
        const { project_id, issue, can_edit, class_name} = this.props

        return (
            <EditableProperty property_key={'issue_assigned_to'+issue.id}
                              initial_value={(issue && issue.assigned_to_id) || null}
                              edit_as_modal={true}
                              onChange={this.onChange}
                              class_name={class_name || ""}
                              actionLabel="Assign to"
                              can_edit={can_edit}
            >
              <IssueAssignedUserForm project_id={project_id}/>
              <OtherUser />
              <div className="text-component--empty">Unassigned</div>
            </EditableProperty>
        )
    }
}


// selGetIssues
const makeMapStateToProps = () => {
    const selGetIssues = makeSelGetIssues()
    const selGetSampleIssue = makeSelGetSampleIssue()

    const mapStateToProps = (state, props) => {
        const { issue_ids, class_name } = props
        const issues = selGetIssues(state, props)
        const issue = selGetSampleIssue(state, props)
        const project_id = issue.project_id
        const can_edit = has_permission(state, issue.project_id, 'has_edit_subject')

        return {
            issues,
            issue_ids,
            issue,
            project_id,
            can_edit,
            class_name
        }
    }
    return mapStateToProps
}


export default connect(makeMapStateToProps)(EditableIssueAssignedUser)

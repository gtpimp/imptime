import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import IssueAssignedUserForm from './form/IssueAssignedUserForm'
import Blank from './form/Blank'
import { updateIssueAssignedTo, getIssues } from '../actions/Issue'
import OtherUser from '../components/OtherUser'

class EditableIssueAssignedUser extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue_ids } = this.props
        console.log(new_value)
        dispatch(updateIssueAssignedTo(issue_ids, new_value.assigned_user))
    }
    render() {
        const { project_id, issue } = this.props
        
        return (
            <div>
                <EditableProperty property_key='issue_assigned_to'
                                  initial_value={issue && issue.assigned_to_id || null}
                                  edit_as_modal={true}
                                  onChange={this.onChange}
                >
                    <IssueAssignedUserForm project_id={project_id}/>
                    <OtherUser />
                    <Blank />
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
    
    return {
        issues: issues,
        issue: issue,
        project_id: project_id
    }
}


export default connect(mapStateToProps)(EditableIssueAssignedUser)

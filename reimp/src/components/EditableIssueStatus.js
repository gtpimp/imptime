import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form'
import EditableProperty from './form/EditableProperty'
import IssueStatusForm from './form/IssueStatusForm'
import IssueStatusLabel from './form/IssueStatusLabel'
import Blank from './form/Blank'
import { updateIssueStatus, getIssues } from '../actions/Issue'
import OtherUser from '../components/OtherUser'
import { getUser } from '../actions/Users'

class EditableIssueStatus extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue_ids } = this.props
        console.log(new_value)
        dispatch(updateIssueStatus(issue_ids, new_value.issue_status_name))
    }
    render() {
        const { issue, project_id } = this.props
        
        return (
            <div>
                <EditableProperty property_key='issue_status_name'
                                  initial_value={issue && issue.status_name || null}
                                  edit_as_modal={true}
                                  onChange={this.onChange}
                >
                    <IssueStatusForm project_id={project_id}/>
                    <IssueStatusLabel />
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

export default connect(mapStateToProps)(EditableIssueStatus)

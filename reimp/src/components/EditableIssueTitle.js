import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import IssueTitleForm from './form/IssueTitleForm'
import { updateIssueSubject, getIssue } from '../actions/Issues'
import { has_permission } from '../actions/Users'

class EditableIssueTitle extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue } = this.props
        dispatch(updateIssueSubject(issue.id, new_value.title))
    }

    render() {
        const { issue, can_edit } = this.props
        
        return (
            <EditableProperty property_key='issue_title'
                              initial_value={issue.subject}
                              onChange={this.onChange}
                              can_edit={can_edit}
            >
                <IssueTitleForm />
                <div className="text-component--readonly">{issue.subject}</div>
                <div className="text-component--empty">Title</div>
            </EditableProperty>
        )
    }

}

function mapStateToProps(state, props) {
    const { issue_id } = props
    const issue = getIssue(state, issue_id) || {}
    const can_edit = has_permission(state, issue.project_id, 'has_edit_subject')
    console.log(issue.subject)
    return {
        issue: issue,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableIssueTitle)

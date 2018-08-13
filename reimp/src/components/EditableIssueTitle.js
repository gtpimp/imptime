import React, {Component} from 'react'
import {connect} from 'react-redux'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import classNames from 'classnames'
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
        dispatch(updateIssueSubject(issue.id, new_value.issue_title))
    }

    render() {
        const { issue, can_edit, project_id } = this.props

        return (
            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_subject'>
              <EditableProperty property_key={'issue_title'+issue.id}
                                initial_value={issue.subject}
                                onChange={this.onChange}
                                can_edit={can_edit}
              >
                <IssueTitleForm />
                <div className={classNames("text-component--readonly",
                                           {issue_title__quality_error:issue.subject_quality_error})}>
                  { issue.subject_quality_error && 
                    <div className="issue_subject__quality_error_reason">
                      Low quality title: {issue.subject_quality_error}
                    </div>
                  }
                    {issue.subject}
                </div>
                <div className="text-component--empty">Title</div>
              </EditableProperty>
            </PermissionInspectorHighlighter>
        )
    }

}

function mapStateToProps(state, props) {
    const { issue_id } = props
    const issue = getIssue(state, issue_id) || {}
    const can_edit = has_permission(state, issue.project_id, 'has_edit_subject')

    return {
        issue: issue,
        can_edit: can_edit,
        project_id: issue.project_id
    }
}


export default connect(mapStateToProps)(EditableIssueTitle)

import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import IssueStatusForm from './form/IssueStatusForm'
import IssueStatusLabel from './form/IssueStatusLabel'
import { updateIssueStatus } from '../actions/Issues'
import { has_permission } from '../actions/Users'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import { makeSelGetIssues, makeSelGetSampleIssue } from '../selectors/IssueSelectors'

class EditableIssueStatus extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue_ids } = this.props
        dispatch(updateIssueStatus(issue_ids, new_value.issue_status_name))
    }

    render() {
        const { issue, project_id, can_edit, class_name, permission_name } = this.props

        return (
            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name={permission_name}>
              <EditableProperty property_key={'issue_status_name_'+issue.id}
                                initial_value={(issue && issue.status_name) || null}
                                edit_as_modal={true}
                                class_name={class_name}
                                onChange={this.onChange}
                                can_edit={can_edit}
                                actionLabel="Issue Status"
              >
                <IssueStatusForm project_id={project_id}/>
                <IssueStatusLabel />
                <div className="text-component--empty">No status</div>
              </EditableProperty>
            </PermissionInspectorHighlighter>
        )
    }
}

const makeMapStateToProps = () => {
    const selGetIssues = makeSelGetIssues()
    const selGetSampleIssue = makeSelGetSampleIssue()
    
    const mapStateToProps = (state, props) => {
        const { class_name } = props
        const issues = selGetIssues(state, props)
        const issue = selGetSampleIssue(state, props)
        const project_id = issue.project_id
        const permission_name = 'has_edit_issue_states'
        const can_edit = has_permission(state, issue.project_id, permission_name)

        return {
            issues: issues,
            issue: issue,
            project_id: project_id,
            can_edit: can_edit,
            permission_name,
            class_name
        }
    }
    return mapStateToProps
}

export default connect(makeMapStateToProps)(EditableIssueStatus)

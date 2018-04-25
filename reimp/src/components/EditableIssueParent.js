import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import SelectIssueParentGroupForm from './form/SelectIssueParentGroupForm'
import IssueLabel from './form/IssueLabel'
import Blank from './form/Blank'
import { groupIssuesIntoFeature, getIssues } from '../actions/Issues'
import { has_permission } from '../actions/Users'

class EditableIssueParent extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue_ids } = this.props
        dispatch(groupIssuesIntoFeature(issue_ids, new_value.issue_id))
    }

    render() {
        const { parent_group_id, project_id, can_edit, issue } = this.props

        return (
            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_issues'>
                <EditableProperty property_key={'parent_group_id_'+issue.id}
                                  initial_value={parent_group_id}
                                  edit_as_modal={true}
                                  onChange={this.onChange}
                                  actionLabel="Set parent issue"
                                  wideView={true} 
                                  can_edit={can_edit}
                >
                    <SelectIssueParentGroupForm project_id={project_id} />
                    <IssueLabel />
                    <Blank/>
                </EditableProperty>
            </PermissionInspectorHighlighter>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue_ids } = props

    const issues = getIssues(state, issue_ids) || []
    const issue = (issues && issues.length > 0 && issues[0]) || {}
    const project_id = issue.project_id
    const parent_group_id = issue.parent_group_id
    const can_edit = has_permission(state, issue.project_id, 'has_edit_issues')

    return {
        issue_ids,
        issue,
        issues: issues,
        project_id: project_id,
        parent_group_id: parent_group_id,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableIssueParent)

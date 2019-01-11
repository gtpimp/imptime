import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import SelectSprintForm from './form/SelectSprintForm'
import Blank from './form/Blank'
import { copyIssuesToSprint, getIssues } from '../actions/Issues'
import { has_permission } from '../actions/Users'

class EditableCopyIssueToSprint extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue_ids } = this.props
        dispatch(copyIssuesToSprint(issue_ids, new_value.sprint_id))
    }

    render() {
        const { sprint_id, project_id, can_edit, issue } = this.props

        return (
            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_add_issue'>
              <EditableProperty property_key={'issue_copy_sprint_id_'+issue.id}
                                initial_value={sprint_id}
                                edit_as_modal={true}
                                onChange={this.onChange}
                                actionLabel="Copy to Sprint"
                                can_edit={can_edit}
              >
                <SelectSprintForm project_id={project_id} />
                <span>&nbsp;(<span>Copy to Sprint</span>)&nbsp;</span>
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
    const sprint_id = issue.sprint_id
    const can_edit = has_permission(state, issue.project_id, 'has_add_issue')

    return {
        issue_ids,
        issues: issues,
        issue,
        project_id: project_id,
        sprint_id: sprint_id,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableCopyIssueToSprint)

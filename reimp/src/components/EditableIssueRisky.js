import React, {Component} from 'react'
import {connect} from 'react-redux'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import EditableProperty from './form/EditableProperty'
import IssueRiskyForm from './form/IssueRiskyForm'
import { updateIssueRisky, getIssues } from '../actions/Issues'
import { has_permission } from '../actions/Users'

class EditableIssueRisky extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue_ids } = this.props
        dispatch(updateIssueRisky(issue_ids, new_value.issue_risky))
    }
    
    render() {
        const { issue, project_id, can_edit, class_name } = this.props

        return (
            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_issues'>
              <EditableProperty property_key={'issue_risky_'+issue.id}
                                initial_value={(issue && issue.risky) || false}
                                edit_as_modal={true}
                                class_name={class_name}
                                onChange={this.onChange}
                                can_edit={can_edit}
                                actionLabel="Issue is risky"
              >
                <IssueRiskyForm project_id={project_id}/>
                <div>
                  { issue.risky === true && "yes" }
                  { issue.risky === false && "no" }
                </div>
                <div className="text-component--empty">no</div>
              </EditableProperty>
            </PermissionInspectorHighlighter>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue_ids, class_name } = props
    const issues = getIssues(state, issue_ids) || []
    const issue = issues && issues.length > 0 && issues[0]
    const project_id = issue.project_id
    const can_edit = has_permission(state, issue.project_id, 'has_edit_issues')

    return {
        issue: issue,
        issue_ids,
        project_id: project_id,
        can_edit: can_edit,
        class_name
    }
}

export default connect(mapStateToProps)(EditableIssueRisky)

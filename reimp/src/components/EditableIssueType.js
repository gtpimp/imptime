import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import IssueTypeForm from './form/IssueTypeForm'
import IssueTypeLabel from './form/IssueTypeLabel'
import { updateIssueType, getIssues } from '../actions/Issues'
import { has_permission } from '../actions/Users'

class EditableIssueType extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue_ids } = this.props
        dispatch(updateIssueType(issue_ids, new_value.issue_type_name))
    }
    
    render() {
        const { issue, project_id, can_edit, class_name } = this.props

        return (
            <EditableProperty property_key={'issue_type_name_'+issue.id}
                              initial_value={(issue && issue.type_name) || null}
                              edit_as_modal={true}
                              class_name={class_name}
                              onChange={this.onChange}
                              can_edit={can_edit}
                              actionLabel="Issue Type"
            >
              <IssueTypeForm project_id={project_id}/>
              <IssueTypeLabel />
              <div className="text-component--empty">Regular issue</div>
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue_ids, class_name } = props
    const issues = getIssues(state, issue_ids) || []
    const issue = issues && issues.length > 0 && issues[0]
    const project_id = issue.project_id
    const can_edit = has_permission(state, issue.project_id, 'has_add_issue')

    return {
        issue: issue,
        issue_ids,
        project_id: project_id,
        can_edit: can_edit,
        class_name
    }
}

export default connect(mapStateToProps)(EditableIssueType)

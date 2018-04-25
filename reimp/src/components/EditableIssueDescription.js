import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import IssueDescriptionForm from './form/IssueDescriptionForm'
import { updateIssueDescription, getIssue } from '../actions/Issues'
import { has_permission } from '../actions/Users'
import RenderedMarkdown from './RenderedMarkdown'

class EditableIssueDescription extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue } = this.props

        dispatch(updateIssueDescription(issue.id, new_value.description))
    }

    render() {
        const { issue, can_edit, project_id } = this.props

        const description = (issue.description || "").trim()
        const enriched_description = (issue.enriched_description || "").trim() || description
        
        return (
            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_description'>
              <EditableProperty property_key={'issue_description'+issue.id}
                                initial_value={description}
                                onChange={this.onChange}
                                can_edit={can_edit}
              >
                <IssueDescriptionForm />
                <div className="text-component--readonly text-component--description">
                  <RenderedMarkdown content={enriched_description} />
                </div>
                <div> </div>
              </EditableProperty>
            </PermissionInspectorHighlighter>
        )
    }

}

function mapStateToProps(state, props) {
    const { issue_id } = props
    const issue = getIssue(state, issue_id)
    const can_edit = has_permission(state, issue.project_id, 'has_edit_description')
    return {
        issue: issue,
        project_id: issue.project_id,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableIssueDescription)

import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
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
        const { issue, can_edit } = this.props

        const description = (issue.description || "").trim()
        const enriched_description = (issue.enriched_description || "").trim() || description
        
        return (
            <EditableProperty property_key={'issue_description'+issue.id}
                              initial_value={description}
                              onChange={this.onChange}
                              can_edit={can_edit}
            >
              <IssueDescriptionForm />
              <div className="text-component--readonly text-component--description">
                <RenderedMarkdown content={enriched_description} />
              </div>
              <div className="text-component--empty text-component--description"> </div>
            </EditableProperty>
        )
    }

}

function mapStateToProps(state, props) {
    const { issue_id } = props
    const issue = getIssue(state, issue_id)
    const can_edit = has_permission(state, issue.project_id, 'has_edit_subject')
    return {
        issue: issue,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableIssueDescription)

import React, {Component} from 'react'
import { intersection, map } from 'lodash'
import {connect} from 'react-redux'
import classNames from 'classnames'
import EditableProperty from './form/EditableProperty'
import TagList from './TagList'
import {
    updateIssueSubject,
    getIssues,
    addTagToIssues,
    deleteTagFromIssues
} from '../actions/Issues'
import {
    updateTags
} from '../actions/Tags'
import { has_permission } from '../actions/Users'

class EditableIssueTag extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onDelete = this.onDelete.bind(this)
    }

    onChange(new_value) {
        const { dispatch } = this.props
        dispatch(updateTags(new_value.tags))
    }

    onDelete(tag_id) {
        const { dispatch, issue_ids } = this.props
        dispatch(deleteTagFromIssues(tag_id, issue_ids))
    }

    onCreate(tag_name, tag_category_name) {
        const { dispatch, issue_ids } = this.props
        dispatch(addTagToIssues(tag_name, tag_category_name, issue_ids))
    }

    render() {
        const { issue, can_edit, selected_tag_ids } = this.props

        return null
        
        if ( !can_edit ) {
            return (
                <TagList tag_ids={selected_tag_ids} />
            )
        }
        
        return (
            <EditableProperty property_key={'issue_tags_'+issue.id}
                              initial_value={selected_tag_ids}
                              onChange={this.onChange}
                              can_edit={can_edit}
            >
              <div>Nope</div>
              <div>Nope</div>
              <div className="text-component--empty"></div>
            </EditableProperty>
        )
    }

}

function mapStateToProps(state, props) {
    const { issue_ids } = props
    const issues = getIssues(state, issue_ids) || []
    const issue = issues && issues.length > 0 && issues[0]
    const can_edit = has_permission(state, issue.project_id, 'has_edit_tags')
    const tag_ids_for_issues = map(issues, 'tag_ids')
    //const selected_tag_ids = intersection(tag_ids_for_issues)
    const selected_tag_ids = tag_ids_for_issues[0]
    
    return {
        issue_ids,
        issues: issues,
        can_edit: can_edit,
        selected_tag_ids
    }
}


export default connect(mapStateToProps)(EditableIssueTag)

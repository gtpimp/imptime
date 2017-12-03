import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import Tag from './Tag'
import EditableIssueTag from './EditableIssueTag'
import { getTags, ensureTagsLoaded } from '../actions/Tags'
import { has_permission } from '../actions/Users'
import { getIssues,
         addTagToIssues,
         deleteTagFromIssues
} from '../actions/Issues'

class TagListFlat extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { tag_ids, dispatch } = props
        dispatch(ensureTagsLoaded(tag_ids))
    }

    render() {
        const {tags, onDelete, can_edit, issue_ids} = this.props
        
        return (
            <div className="tag_list">
              { tags.length == 0 &&
                <div className="tag-list__empty">
                  No tags
                </div>
              }

              { !can_edit && (
                    <div>
                      { map(tags, function(tag) {
                            return (
                                <Tag key={tag.id} tag_id={tag.id} />
                            )
                        })}
                    </div>
              )}
              { can_edit && (
                    <div>
                      { map(tags, function(tag) {
                            return (
                                <EditableIssueTag key={tag.id} issue_ids={issue_ids} tag_id={tag.id} />
                            )
                        })
                      }
                      <EditableIssueTag issue_ids={issue_ids} tag_id={null}/>
                    </div>
              )}
              
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { tag_ids, onDelete, issue_ids } = props
    const issues = getIssues(state, issue_ids)
    const issue = (issues && issues.length > 0 && issues[0]) || {}
    const tag_ids_for_issues = map(issues, 'tag_ids')
    
    //const tag_ids = intersection(tag_ids_for_issues)
    const active_tag_ids = tag_ids_for_issues[0]
    const tags = getTags(state, active_tag_ids) || []
    
    const can_edit = issue.id && has_permission(state, issue.project_id, 'has_edit_tags')
    return {
        issue_ids,
        issues,
        active_tag_ids,
        tags,
        onDelete,
        can_edit,
    }
}

export default connect(mapStateToProps)(TagListFlat)

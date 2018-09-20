import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map, intersection } from 'lodash'
import Tag from './Tag'
import EditableIssueTag from './EditableIssueTag'
import { getTags, ensureTagsLoaded } from '../actions/Tags'
import { has_permission } from '../actions/Users'
import { getIssues } from '../actions/Issues'

class TagListFlat extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { active_tag_ids, dispatch } = props
        dispatch(ensureTagsLoaded(active_tag_ids))
    }

    render() {
        const {tags, can_edit, issue_ids, project_id} = this.props
        
        return (
            <div className="tag_list">
              { tags.length === 0 &&
                <div className="tag-list__empty">
                  
                </div>
              }

              { !can_edit && (
              <div>
                { map(tags, function(tag) {
                return (
                <Tag key={tag.id} tag_id={tag.id}/>
                  )
                  })}
              </div>
              )}
              { can_edit && (
              <div>
                { map(tags, function(tag) {
                return (
                <EditableIssueTag key={tag.id} issue_ids={issue_ids} tag_id={tag.id} project_id={project_id} />
                )
                })
                }
                <EditableIssueTag issue_ids={issue_ids} tag_id={null} project_id={project_id}/>
              </div>
              )}
              
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { issue_ids, can_edit } = props
    const issues = getIssues(state, issue_ids)
    const issue = (issues && issues.length > 0 && issues[0]) || {}
    const project_id = issue.project_id
    const tag_ids_for_issues = map(issues, 'tag_ids')
    
    const active_tag_ids = intersection(...tag_ids_for_issues)
    //const active_tag_ids = tag_ids_for_issues[0]
    const tags = getTags(state, active_tag_ids) || []
    
    return {
        issue_ids,
        issues,
        project_id,
        active_tag_ids,
        tags,
        can_edit: can_edit!==false && issue.id && has_permission(state, issue.project_id, 'has_edit_tags')
    }
}

export default connect(mapStateToProps)(TagListFlat)
 

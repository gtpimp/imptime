import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import {
    updateIssueComment,
    createIssueComment,
    deleteIssueComment,
    ensureIssuesLoaded,
    getIssue,
    is_issue_invalidated
} from '../actions/Issues'
import IssueCommentForm from './form/IssueCommentForm'
import { has_permission } from '../actions/Users'
import IssueComment from './IssueComment'

class EditableIssueComment extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onDelete = this.onDelete.bind(this)
    }

    componentWillMount() {
        const { dispatch, issue_id } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { issue_id } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    onChange(new_value) {
        const { dispatch, issue_id, comment_id } = this.props
        if ( comment_id ) {
            dispatch(updateIssueComment(issue_id, comment_id, new_value.comment))
        } else {
            dispatch(createIssueComment(issue_id, new_value.comment))
        }
    }



    onDelete(event) {
        const { dispatch, issue_id, comment_id } = this.props
        event.stopPropagation()
        if ( ! window.confirm("Are you sure you want to delete this comment?" ) ) {
            return false;
        }
        dispatch(deleteIssueComment(issue_id, comment_id))
    }

    render() {
        const {comment, can_edit, issue_id, project_id} = this.props
        return (

            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_add_issue_comment'>
              { comment.id &&
                <EditableProperty property_key={'issue_comment_'+issue_id+'_'+comment.id}
                                  initial_value={comment.comment}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                >
                  <IssueCommentForm form={'issue_comment_form_'+issue_id+'_'+comment.id}
                                    issue_id={issue_id} comment={comment}/>
                  <IssueComment issue_id={issue_id}
                                comment={comment}
                                onDelete={this.onDelete} />
                  <div className="text-component--empty"></div>
                </EditableProperty>
              }

              { ! comment.id &&
                <div>
                  <EditableProperty property_key={'issue_comment_'+issue_id}
                                    initial_value=''
                                    onChange={this.onChange}
                                    can_edit={can_edit}
                  >
                    <IssueCommentForm form={'issue_comment_form_'+issue_id} issue_id={issue_id} />
                    <div className="text-component--readonly"></div>
                    <div className="text-component--empty">
                      <div className="icon--add" data-tooltip="Create comment"></div>
                    </div>
                  </EditableProperty>
                </div>
              }

            </PermissionInspectorHighlighter>
        )
    }
}

function mapStateToProps(state, props) {

    const { issue_id, comment_id } = props
    const issue = getIssue(state, issue_id) || {}
    const can_edit = has_permission(state, issue.project_id, 'has_add_issue_comment')

    let comment = { id: null}
    map(issue.comments || [], function(issue_comment, index) {
        if ( issue_comment.id === comment_id ) {
            comment = issue_comment
        }
    })

    return {
        issue_id: issue_id,
        project_id: issue.project_id,
        comment_id: comment_id,
        comment: comment,
        can_edit: can_edit,
        is_invalidated: is_issue_invalidated(state, issue.id),
    }
}


export default connect(mapStateToProps)(EditableIssueComment)

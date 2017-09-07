import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import EditableProperty from './form/EditableProperty'
import {
    updateIssueComment,
    createIssueComment,
    deleteIssueComment,
    getIssue
} from '../actions/Issues'
import IssueCommentForm from './form/IssueCommentForm'
import Label from './form/Label'
import Blank from './form/Blank'
import { has_permission } from '../actions/Users'

class EditableIssueComment extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onDelete = this.onDelete.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue_id, comment_id } = this.props
        if ( comment_id ) {
            dispatch(updateIssueComment(issue_id, comment_id, new_value.comment))
        } else {
            dispatch(createIssueComment(issue_id, new_value.comment))
        }
    }

    onDelete(new_value) {
        const { dispatch, issue_id, comment_id } = this.props
        dispatch(deleteIssueComment(issue_id, comment_id))
    }

    render() {
        const {comment, can_edit, issue_id} = this.props
        return (

            <div>
              { comment.id &&
                <EditableProperty property_key={'issue_comment_'+issue_id+'_'+comment.id}
                                  initial_value={comment.comment}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                    >
                  <IssueCommentForm form={'issue_comment_form_'+issue_id+'_'+comment.id}
                                    issue_id={issue_id} comment={comment}/>
                  <div className="text-component--readonly text-component--comment">{comment.comment}</div>
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
                      <button>Create comment</button>
                    </div>
                  </EditableProperty>
                </div>
              }

              { comment.id && <button onClick={this.onDelete}>delete</button> }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { issue_id, comment_id } = props
    const issue = getIssue(state, issue_id) || {}
    const can_edit = has_permission(state, issue.project_id, 'has_edit_subject')

    let comment = { id: null}
    map(issue.comments || [], function(issue_comment, index) {
        if ( issue_comment.id === comment_id ) {
            comment = issue_comment
        }
    })

    return {
        issue_id: issue_id,
        comment_id: comment_id,
        comment: comment,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableIssueComment)

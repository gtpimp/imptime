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
        const {comment, can_edit} = this.props

        return (

            <div>
              { comment &&
                <EditableProperty property_key={'issue_comment_'+comment.id}
                                  initial_value={comment.comment}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                    >
                  <IssueCommentForm />
                  <Label />
                  <Blank />
                </EditableProperty>
              }

              { ! comment &&
                test
                <EditableProperty property_key={'issue_comment'}
                                  initial_value=''
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                    >
                  <IssueCommentForm />
                  <Label />
                  <Blank />
                </EditableProperty>
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

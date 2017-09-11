import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import EditableProperty from './form/EditableProperty'
import {
    updateIssueComment,
    createIssueComment,
    deleteIssueComment,
    ensureIssuesLoaded,
    getIssue,
    is_issue_invalidated
} from '../actions/Issues'
import IssueCommentForm from './form/IssueCommentForm'
import Label from './form/Label'
import Blank from './form/Blank'
import { has_permission } from '../actions/Users'
import OtherUser from '../components/OtherUser'

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
                  <div className="text-component--readonly text-component--comment">
                    <div className="issue_sidebar--comment_date" >
                      {comment.modified} - <div className="issue_sidebar--comment_author">
                      <OtherUser value={comment.author_id} /></div>
                    </div>
                    <div className="issue_sidebar--textarea--readonly" >
                      {comment.comment}
                    </div>
                  </div>
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
                      <button className="button button--primary issue_sidebar--button">Create comment</button>
                    </div>
                  </EditableProperty>
                </div>
              }

              { comment.id && <button className="button button--danger issue_sidebar--button" onClick={this.onDelete}>delete</button> }
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
        can_edit: can_edit,
        is_invalidated: is_issue_invalidated(state, issue.id),
    }
}


export default connect(mapStateToProps)(EditableIssueComment)

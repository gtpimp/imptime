import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getIssue, ensureIssuesLoaded } from '../actions/Issues'
import {browserHistory} from 'react-router'
import OtherUser from '../components/OtherUser'
import RenderedMarkdown from './RenderedMarkdown'
import { has_permission } from '../actions/Users'
import { startGlobalCommentAnnotation } from '../actions/GlobalCommentAnnotation'

class IssueComment extends Component {

    constructor(props) {
        super(props)
        this.onAnnotate = this.onAnnotate.bind(this)
    }
    
    componentDidMount() {
        const { dispatch, issue_id } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, issue_id } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    onAnnotate(event) {
        const { dispatch, issue_id, comment } = this.props
        if ( event ) {
            event.preventDefault()
            event.stopPropagation()
        }
        dispatch(startGlobalCommentAnnotation(issue_id, comment.id))
    }

    render() {
        const { comment, onDelete, can_annotate } = this.props

        return (
            <div className="issue-comment">
              <div className="issue-comment__text" >
                <RenderedMarkdown content={comment.comment} />
              </div>
              <div className="issue-comment__info" >
                <div className="issue_sidebar--comment_type">
                  <div className={"icon--comment-type--"+comment.comment_type} />
                </div>
                <div className="issue_sidebar--comment_author">
                  <OtherUser user_id={comment.author_id} />
                </div>
                <div>
                  {comment.modified}
                </div>
                { onDelete &&
                  <div onClick={onDelete} className="icon--small-delete" />
                }
                { can_annotate &&
                  <div onClick={this.onAnnotate} className="icon--comment-annotate" />
                }
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const { issue_id, comment, onDelete } = props
    const issue = getIssue(state, issue_id)
    const can_annotate = has_permission(state, issue.project_id, 'has_add_issue')
    
    return {
        issue,
        comment,
        onDelete,
        can_annotate
    }
}


export default connect(mapStateToProps)(IssueComment)

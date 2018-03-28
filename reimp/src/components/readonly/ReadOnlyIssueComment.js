import React, {Component} from 'react'
import {connect} from 'react-redux'
import { keyBy } from 'lodash'
import { getIssueByRef, ensureIssuesLoadedByRef } from '../../actions/Issues'
import {browserHistory} from 'react-router'
import OtherUser from '../../components/OtherUser'
import RenderedMarkdown from '../RenderedMarkdown'

class ReadOnlyIssueComment extends Component {

    componentDidMount() {
        const { dispatch, issue_ref, comment_ref } = this.props
        dispatch(ensureIssuesLoadedByRef(issue_ref, comment_ref))
    }

    render() {
        const { issue, comment_ref } = this.props
        const comments = (issue && issue.comments) || []
        const comment = keyBy(comments, "share_ref")[comment_ref]

        if ( ! comment ) {
            return (
                <div className="readonly__issue-comment">
                  Loading...
                </div>
            )
        }
        
        return (
            <div className="readonly__issue-comment">
              <div className="readonly__issue-comment__text" >
                <RenderedMarkdown content={comment.comment} />
              </div>
              <div className="readonly__issue-comment__info" >
                <div className="readonly__issue_sidebar--comment_type">
                  <div className={"icon--comment-type--"+comment.comment_type} />
                </div>
                <div className="readonly__issue_sidebar--comment_author">
                  <OtherUser user_id={comment.author_id} />
                </div>
                <div>
                  {comment.modified}
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const { obj_ref, subref } = props
    const issue_ref = obj_ref
    const comment_ref = subref
    const issue = getIssueByRef(state, issue_ref)
    
    return {
        issue,
        issue_ref,
        comment_ref
    }
}


export default connect(mapStateToProps)(ReadOnlyIssueComment)

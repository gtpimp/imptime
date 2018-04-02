import React, {Component} from 'react'
import {connect} from 'react-redux'
import { keyBy } from 'lodash'
import { getIssueByRef, ensureIssuesLoadedByRef } from '../../actions/Issues'
import {withRouter} from 'react-router-dom'
import RenderedMarkdown from '../RenderedMarkdown'
import IssueName from '../IssueName'
import Timestamp from '../Timestamp'

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
                <div className="sharing__issue-comment">
                  Loading...
                </div>
            )
        }
        
        return (
            <div className="sharing__issue-comment">
              <div className="sharing__title">
                <h3><IssueName issue_id={issue.id} /></h3>
              </div>
              <div className="sharing__disclaimer">
                <div>
                  This is a read-only and shared version of this text. It will expire
                </div>
                <Timestamp value={comment.share_ref_expiry} format='from_now' />
              </div>
              <div className="sharing__issue-comment__text" >
                <RenderedMarkdown content={comment.enriched_comment || comment.comment} />
              </div>
              <div className="sharing__issue-comment__info" >
                Last modified <Timestamp value={comment.modified} format='from_now' />
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

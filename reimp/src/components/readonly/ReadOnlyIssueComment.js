import React, {Component} from 'react'
import {connect} from 'react-redux'
import { keyBy } from 'lodash'
import { getIssueByRef, ensureIssuesLoadedByRef } from '../../actions/Issues'
import {browserHistory} from 'react-router'
import OtherUser from '../../components/OtherUser'
import RenderedMarkdown from '../RenderedMarkdown'

class ReadOnlyIssueComment extends Component {

    componentDidMount() {
        const { dispatch, issue_ref } = this.props
        dispatch(ensureIssuesLoadedByRef(issue_ref))
    }

    render() {
        const { issue, comment_ref } = this.props
        const comment = keyBy(issue.comments, "ref")[comment_ref]

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
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const { ref, subref } = props
    const issue_ref = ref
    const comment_ref = subref
    const issue = getIssueByRef(issue_ref)
    
    return {
        issue,
        issue_ref,
        comment_ref
    }
}


export default connect(mapStateToProps)(ReadOnlyIssueComment)

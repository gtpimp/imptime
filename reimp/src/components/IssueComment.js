import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getIssue, ensureIssuesLoaded } from '../actions/Issues'
import {browserHistory} from 'react-router'
import OtherUser from '../components/OtherUser'

class IssueComment extends Component {

    componentDidMount() {
        const { dispatch, issue_id } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, issue_id } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    render() {
        const { issue, comment } = this.props

        return (
            <div className="issue-comment">
              <div className="issue-comment__text" >
                {comment.comment}
              </div>
              <div className="issue-comment__info" >
                <div>
                  {comment.modified}
                </div>
                <div className="issue_sidebar--comment_author">
                  <OtherUser user_id={comment.author_id} />
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const { issue_id, comment } = props
    const issue = getIssue(state, issue_id)
    
    return {
        issue,
        comment
    }
}


export default connect(mapStateToProps)(IssueComment)

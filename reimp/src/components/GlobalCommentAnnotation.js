import React, {Component} from 'react'
import {connect} from 'react-redux'
import { keyBy } from 'lodash'
import { getIssue, ensureIssuesLoaded } from '../actions/Issues'
import {browserHistory} from 'react-router'
import OtherUser from '../components/OtherUser'
import RenderedMarkdown from './RenderedMarkdown'
import { has_permission } from '../actions/Users'
import { getGlobalCommentAnnotation } from '../actions/GlobalCommentAnnotation'

class GlobalCommentAnnotation extends Component {

    constructor(props) {
        super(props)
    }
    
    componentDidMount() {
        const { dispatch, issue_id } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, issue_id } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    render() {
        const { issue, comment_id, can_annotate } = this.props

        if ( ! can_annotate ) {
            return null
        }
        if ( ! issue.id ) {
            return null
        }

        const comment = keyBy(issue.comments, "id")[comment_id]
        
        return (
            <div className="issue-comment">
              <div className="issue-comment__text" >
                <RenderedMarkdown content={comment.comment} />
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const gca = getGlobalCommentAnnotation(state)
    const { issue_id, comment_id } = gca
    const issue = getIssue(state, issue_id)
    const can_annotate = issue && has_permission(state, issue.project_id, 'has_add_issue')
    
    return {
        issue,
        issue_id,
        comment_id,
        can_annotate
    }
}


export default connect(mapStateToProps)(GlobalCommentAnnotation)

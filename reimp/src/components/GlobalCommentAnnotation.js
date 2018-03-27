import React, {Component} from 'react'
import {connect} from 'react-redux'
import { keyBy } from 'lodash'
import { getIssue, ensureIssuesLoaded } from '../actions/Issues'
import RenderedMarkdown from './RenderedMarkdown'
import { has_permission } from '../actions/Users'
import { getGlobalCommentAnnotation, stopGlobalCommentAnnotation } from '../actions/GlobalCommentAnnotation'
import Rnd from 'react-rnd'
import IssueName from './IssueName'

class GlobalCommentAnnotation extends Component {

    constructor(props) {
        super(props)
        this.onCancel = this.onCancel.bind(this)
    }
    
    componentDidMount() {
        const { dispatch, issue_id } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, issue_id } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    onCancel() {
        const { dispatch } = this.props
        dispatch(stopGlobalCommentAnnotation())
    }

    render() {
        const { issue, issue_id, comment_id, can_annotate } = this.props

        if ( ! can_annotate ) {
            return null
        }
        if ( ! issue.id ) {
            return null
        }

        const comment = keyBy(issue.comments, "id")[comment_id]
        
        return (
            <Rnd className="global-comment-annotation">
              <div className="global-comment-annotation--header">
                <h3 >
                  Annotating for <IssueName issue_id={issue_id}/>
                </h3>
                <div className="global-comment-annotation__close">
                  <i className="material-icons" onClick={this.onCancel}>close</i>
                </div>
              </div>
              <div className="global-comment-annotation--body">
                <RenderedMarkdown content={comment.comment} />
              </div>
            </Rnd>
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

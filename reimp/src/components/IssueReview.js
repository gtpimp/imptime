import React, {Component} from 'react'
import {connect} from 'react-redux'
import Timestamp from '../components/Timestamp'
import { has_permission } from '../actions/Users'
import { getIssueReview,
         ensureIssueReviewsLoaded
} from '../actions/IssueReviews'
import {
    ensureSprintsLoaded,
    getSprint
} from '../actions/Sprints'
import OtherUser from './OtherUser'
import moment from 'moment'

class IssueReview extends Component {

    componentDidMount() {
        const { dispatch, issue_review_id, sprint_id } = this.props
        if ( issue_review_id ) {
            dispatch(ensureIssueReviewsLoaded([issue_review_id]))
            sprint_id && dispatch(ensureSprintsLoaded([sprint_id]))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { issue_review_id, sprint_id } = new_props
        if ( issue_review_id ) {
            dispatch(ensureIssueReviewsLoaded([issue_review_id]))
            sprint_id && dispatch(ensureSprintsLoaded([sprint_id]))
        }
    }

    render() {

        const {issue_review, can_view} = this.props
        if ( ! can_view ) {
            return (<div></div>)
        }

        return (
            <div className="issue-review">
              <div className="issue-review--type">
                <OtherUser user_id={issue_review.reviewed_by} />
                at
                <Timestamp value={issue_review.last_reviewed_at} />
              </div>
            </div>
        )
    }    
    
}

function mapStateToProps(state, props) {

    const { issue_review_id } = props
    const issue_review = getIssueReview(state, issue_review_id) || {}
    const sprint = (issue_review.sprint_id && getSprint(state, issue_review.sprint_id)) || {}
    const can_view = (sprint.id && has_permission(state, sprint.project_id, 'has_view_issue_reviews')) || false
    
    return {
        issue_review_id: issue_review_id,
        sprint_id: sprint.id,
        issue_review: issue_review,
        issue_review_modified: issue_review.modified,
        can_view: can_view
    }
}

export default connect(mapStateToProps)(IssueReview)

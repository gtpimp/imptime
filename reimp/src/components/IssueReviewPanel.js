import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import Timestamp from '../components/Timestamp'
import { has_permission } from '../actions/Users'
import { getIssueReviews,
         ensureIssueReviewsLoaded
} from '../actions/IssueReviews'
import { getIssue, ensureIssuesLoaded } from '../actions/Issues'
import {
    ensureSprintsLoaded,
    getSprint
} from '../actions/Sprints'
import OtherUser from './OtherUser'
import moment from 'moment'
import IssueReview from './IssueReview'

class IssueReviewPanel extends Component {

    componentDidMount() {
        const { dispatch, issue_id, issue, issue_review_ids, sprint_id } = this.props
        if ( issue_id ) {
            dispatch(ensureIssuesLoaded([issue_id]))
        }
        if ( sprint_id ) {
            dispatch(ensureSprintsLoaded([sprint_id]))
        }
        if ( issue_review_ids ) {
            dispatch(ensureIssueReviewsLoaded(issue_review_ids))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { issue_id, issue_review_ids, sprint_id } = new_props
        if ( issue_id ) {
            dispatch(ensureIssuesLoaded([issue_id]))
        }
        if ( sprint_id ) {
            dispatch(ensureSprintsLoaded([sprint_id]))
        }
        if ( issue_review_ids ) {
            dispatch(ensureIssueReviewsLoaded(issue_review_ids))
        }
    }

    render() {

        const {review_due_at_by_any_user, issue_review_ids, can_view} = this.props
        if ( ! can_view ) {
            return (<div></div>)
        }

        return (
            <div className="issue-review">
              <div className="issue-review__next-review-due-at">
                { review_due_at_by_any_user &&
                  <div>
                    Next review due at: <Timestamp value={review_due_at_by_any_user} />
                  </div>
                }
                { !review_due_at_by_any_user &&
                  <div>
                    Has never been reviewed
                  </div>
                }
              </div>
              <div className="issue-review__review_due_per_user">
                { map(issue_review_ids, (issue_review_id) => <IssueReview issue_review_id={issue_review_id} />) }
              </div>
            </div>
        )
    }    
}

function mapStateToProps(state, props) {

    const { issue_id } = props
    const issue = getIssue(state, issue_id) || {}
    const issue_reviews = getIssueReviews(state, issue.review_ids || []) || []
    const sprint = (issue.sprint_id && getSprint(state, issue.sprint_id)) || {}
    const can_view = (sprint.id && has_permission(state, sprint.project_id, 'has_view_review_cycle')) || false
    const review_due_at_by_any_user = (issue_reviews.length > 0 && issue_reviews.review_due_at_by_any_user) || null
    
    return {
        issue,
        issue_review_ids: issue.review_ids || [],
        issue_reviews,
        sprint_id: issue.sprint_id,
        can_view,
        review_due_at_by_any_user
    }
}

export default connect(mapStateToProps)(IssueReviewPanel)

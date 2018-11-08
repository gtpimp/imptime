import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map, keyBy } from 'lodash'
import { has_permission } from '../actions/Users'
import { getIssueReviews,
         ensureIssueReviewsLoaded
} from '../actions/IssueReviews'
import { getSprintReviews,
         ensureSprintReviewsLoaded,
         isLoadingSprintReviews
} from '../actions/SprintReviews'
import { getIssue, ensureIssuesLoaded, reviewNow} from '../actions/Issues'
import { logged_in_user } from '../actions/Auth'
import {
    ensureSprintsLoaded,
    getSprint
} from '../actions/Sprints'
import IssueReview from './IssueReview'
import SprintReview from './SprintReview'

class IssueReviewPanel extends Component {

    constructor(props) {
        super(props)
        this.onReviewed = this.onReviewed.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, issue_id, issue_review_ids, sprint_id, sprint_review_ids } = props
        if ( issue_id ) {
            dispatch(ensureIssuesLoaded([issue_id]))
        }
        if ( sprint_id ) {
            dispatch(ensureSprintsLoaded([sprint_id]))
        }
        if ( issue_review_ids ) {
            dispatch(ensureIssueReviewsLoaded(issue_review_ids))
        }
        if ( sprint_review_ids ) {
            dispatch(ensureSprintReviewsLoaded(sprint_review_ids))
        }
    }
    
    onReviewed() {
        const { dispatch, issue_id } = this.props
        dispatch(reviewNow([issue_id]))
    }

    render() {

        const {sprint_reviews, can_view, sprint, has_ever_been_reviewed,
               issue_reviews_by_user_id, logged_in_user_id} = this.props
        const that = this
        if ( ! can_view ) {
            return (<div></div>)
        }

        return (
            <div className="issue-review-panel">
              <div>
                { !has_ever_been_reviewed &&
                  <div className="issue-review-panel__next-review-due-at">
                    Has never been reviewed
                  </div>
                }
              </div>
              <div className="issue-review-panel__review_due_per_user">
                { map(sprint_reviews, function(sprint_review) {
                      const issue_review = issue_reviews_by_user_id[sprint_review.review_by_id]
                      if ( sprint_review.loaded === false ) {
                          return null
                      }
                      return (
                          <div key={sprint_review.id}>
                            <SprintReview sprint_review_id={sprint_review.id} />
                            { issue_review && <IssueReview issue_review_id={issue_review.id} /> }
                            { sprint.sprint_type !== "inbox" && sprint_review.review_by_id === logged_in_user_id &&
                              <button className="button button--primary sprint_sidebar--button" onClick={that.onReviewed}>Reviewed now</button>
                            }
                            { sprint.sprint_type === "inbox" && sprint_review.review_by_id === logged_in_user_id &&
                              <div>
                                Inbox issues are reviewed by moving them to a different sprint
                              </div>
                            }
                            
                          </div>
                      )
                  })
                }
              </div>
              <div>
                
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
    const sprint_reviews = getSprintReviews(state, sprint.review_ids || []) || []
    const can_view = (sprint.id && has_permission(state, sprint.project_id, 'has_view_review_cycle')) || false
    const review_due_at_by_any_user = (issue_reviews.length > 0 && issue_reviews[0].review_due_at_by_any_user) || null
    const has_ever_been_reviewed = issue_reviews.length > 0
    const issue_reviews_by_user_id = keyBy(issue_reviews, 'reviewed_by_id')
    const logged_in_user_id = "" + logged_in_user(state).user_id
    const is_loading = isLoadingSprintReviews(state, sprint.review_ids)
    
    return {
        issue_id,
        issue,
        issue_review_ids: issue.review_ids || [],
        issue_reviews,
        sprint_review_ids: sprint.review_ids || [],
        sprint_reviews,
        sprint,
        sprint_id: issue.sprint_id,
        logged_in_user_id,
        can_view,
        is_loading,
        review_due_at_by_any_user,
        has_ever_been_reviewed,
        issue_reviews_by_user_id,
    }
}

export default connect(mapStateToProps)(IssueReviewPanel)

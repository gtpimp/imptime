import React, {Component} from 'react'
import {connect} from 'react-redux'
import Timestamp from '../components/Timestamp'
import { has_permission } from '../actions/Users'
import { getSprintReview,
         ensureSprintReviewsLoaded
} from '../actions/SprintReviews'
import {
    ensureSprintsLoaded,
    getSprint
} from '../actions/Sprints'
import moment from 'moment'
import OtherUser from 'OtherUser'

class SprintReview extends Component {

    componentDidMount() {
        const { dispatch, review_id, sprint_id } = this.props
        if ( review_id ) {
            dispatch(ensureSprintReviewsLoaded([review_id]))
            sprint_id && dispatch(ensureSprintsLoaded([sprint_id]))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { review_id, sprint_id } = new_props
        if ( review_id ) {
            dispatch(ensureSprintReviewsLoaded([review_id]))
            sprint_id && dispatch(ensureSprintsLoaded([sprint_id]))
        }
    }

    render() {

        const {review, can_view, sprint_id} = this.props
        if ( ! can_view ) {
            return (<div></div>)
        }

        return (
            <div className="sprint-review">
              <div className="sprint-review--heading">
                <div className="sprint-review--type">
                  <OtherUser user_id={review.review_by_id} />
                </div>
              </div>
              <div className="sprint-review--description">
                to review every {review.review_cycle_days} days
              </div>
            </div>
        )
    }    
}

function mapStateToProps(state, props) {

    const { review_id } = props
    const review = getSprintReview(state, review_id) || {}
    const sprint = (review.sprint_id && getSprint(state, review.sprint_id)) || {}
    const can_view = (sprint.id && has_permission(state, sprint.project_id, 'has_edit_review_cycle')) || false
    
    return {
        review_id: review_id,
        sprint_id: sprint.id,
        review: review,
        review_modified: review.modified,
        can_view: can_view
    }
}

export default connect(mapStateToProps)(SprintReview)

import React, {Component} from 'react'
import {connect} from 'react-redux'
import { has_permission } from '../actions/Users'
import { getSprintReview,
         ensureSprintReviewsLoaded
} from '../actions/SprintReviews'
import {
    ensureSprintsLoaded,
    getSprint
} from '../actions/Sprints'
import OtherUser from './OtherUser'

class SprintReview extends Component {

    componentDidMount() {
        const { dispatch, sprint_review_id, sprint_id } = this.props
        if ( sprint_review_id ) {
            dispatch(ensureSprintReviewsLoaded([sprint_review_id]))
            sprint_id && dispatch(ensureSprintsLoaded([sprint_id]))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { sprint_review_id, sprint_id } = new_props
        if ( sprint_review_id ) {
            dispatch(ensureSprintReviewsLoaded([sprint_review_id]))
            sprint_id && dispatch(ensureSprintsLoaded([sprint_id]))
        }
    }

    render() {

        const {sprint_review, can_view} = this.props
        if ( ! can_view ) {
            return (<div></div>)
        }

        return (
            <div className="sprint-review">
              <div className="sprint-review__summary">
                <div className="sprint-review--heading">
                  <div className="sprint-review__review_by">
                    <OtherUser user_id={sprint_review.review_by_id} />
                  </div>
                </div>
                <div className="sprint-review__review_cycle_days">
                  to review every {sprint_review.review_cycle_days} days
                </div>
                { sprint_review.must_always_review && 
                  <div className="sprint-review__must_always_review">
                    regardless of other reviews
                  </div>
                }
                { !sprint_review.must_always_review && 
                  <div className="sprint-review__need_not_always_review">
                    only if no-one else has reviewed
                  </div>
                }
              </div>
            </div>
        )
    }    
}

function mapStateToProps(state, props) {

    const { sprint_review_id } = props
    const sprint_review = getSprintReview(state, sprint_review_id) || {}
    const sprint = (sprint_review.sprint_id && getSprint(state, sprint_review.sprint_id)) || {}
    const can_view = (sprint.id && has_permission(state, sprint.project_id, 'has_edit_review_cycle')) || false
    
    return {
        sprint_review_id: sprint_review_id,
        sprint_id: sprint.id,
        sprint_review: sprint_review,
        sprint_review_modified: sprint_review.modified,
        can_view: can_view
    }
}

export default connect(mapStateToProps)(SprintReview)

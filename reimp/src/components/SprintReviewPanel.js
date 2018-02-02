import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import Timestamp from '../components/Timestamp'
import { has_permission } from '../actions/Users'
import { getSprintReviews,
         ensureSprintReviewsLoaded
} from '../actions/SprintReviews'
import { getSprint, ensureSprintsLoaded } from '../actions/Sprints'
import OtherUser from './OtherUser'
import moment from 'moment'
import EditableSprintReviewCycle from './EditableSprintReviewCycle'

class SprintReviewPanel extends Component {

    componentDidMount() {
        const { dispatch, sprint_id, sprint, sprint_review_ids } = this.props
        if ( sprint_id ) {
            dispatch(ensureSprintsLoaded([sprint_id]))
        }
        if ( sprint_review_ids ) {
            dispatch(ensureSprintReviewsLoaded(sprint_review_ids))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { sprint_id, sprint_review_ids } = new_props
        if ( sprint_id ) {
            dispatch(ensureSprintsLoaded([sprint_id]))
        }
        if ( sprint_review_ids ) {
            dispatch(ensureSprintReviewsLoaded(sprint_review_ids))
        }
    }

    render() {

        const {sprint_review_ids, can_view, can_edit, sprint_id} = this.props
        if ( ! can_view ) {
            return (<div></div>)
        }

        return (
            <div className="sprint-review-panel">
              <p>#Sprint Review Panel#</p>
              <div className="sprint-review-panel__review_due_per_user">
                { map(sprint_review_ids, function(sprint_review_id) {
                      return (
                          <EditableSprintReviewCycle key={sprint_review_id}
                                                     can_edit={can_edit}
                                                     sprint_id={sprint_id}
                                                     sprint_review_id={sprint_review_id} />
                      )})
                }
                { can_edit && <EditableSprintReviewCycle sprint_review_id={null} sprint_id={sprint_id}/> }
              </div>
              <p>#Sprint Review Panel End#</p>
            </div>
        )
    }    
}

function mapStateToProps(state, props) {

    const { sprint_id } = props
    const sprint = getSprint(state, sprint_id) || {}
    const sprint_reviews = getSprintReviews(state, sprint.review_ids || []) || []
    const can_view = (sprint.id && has_permission(state, sprint.project_id, 'has_view_review_cycle')) || false
    const can_edit = (sprint.id && has_permission(state, sprint.project_id, 'has_edit_review_cycle')) || false
    
    return {
        sprint,
        loaded: sprint.id || false,
        sprint_review_ids: sprint.review_ids || [],
        sprint_reviews,
        sprint_id: sprint.id,
        can_view,
        can_edit
    }
}

export default connect(mapStateToProps)(SprintReviewPanel)

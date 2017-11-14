import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import SprintReviewForm from './form/SprintReviewForm'
import { getSprint } from '../actions/Sprints'
import { has_permission } from '../actions/Users'
import {
    ensureSprintReviewsLoaded,
    updateSprintReview,
    createSprintReview,
    deleteSprintReview,
    getSprintReview
} from '../actions/SprintReviews'
import SprintReview from './SprintReview'
import OtherUser from './OtherUser'

class EditableSprintReviewCycle extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onDelete = this.onDelete.bind(this)
    }

    componentDidMount() {
        const { dispatch, sprint_review_id } = this.props
        if ( sprint_review_id ) {
            dispatch(ensureSprintReviewsLoaded([sprint_review_id]))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { sprint_review_id } = new_props
        if ( sprint_review_id ) {
            dispatch(ensureSprintReviewsLoaded([sprint_review_id]))
        }
    }
    
    onChange(new_values) {
        const { dispatch, sprint_review_id, sprint_id } = this.props
        new_values.sprint_id = sprint_id
        if ( sprint_review_id ) {
            dispatch(updateSprintReview([sprint_review_id], new_values))
        } else {
            dispatch(createSprintReview(new_values))
        }
    }

    onDelete(event) {
        const { dispatch, sprint_review_id } = this.props
        event.stopPropagation()
        if ( ! confirm("Delete these review criteria?") ) {
            return
        }
        dispatch(deleteSprintReview(sprint_review_id))
    }

    render() {
        const { sprint_id, sprint_review_id, sprint_review, can_view, can_edit } = this.props

        if ( ! can_view ) {
            return null
        }

        return (
            <div>
              { sprint_review_id && 
                <EditableProperty property_key={'sprint_review_'+sprint_id+'_'+sprint_review_id}
                                  initial_value={sprint_review}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                                  edit_as_modal={true}
                                  actionLabel="Edit Sprint Review Cycle Days"
                    >
                  <SprintReviewForm form={'sprint_review_form_'+sprint_id+'_'+sprint_review_id}
                                    sprint_id={sprint_id}
                                    sprint_review={sprint_review}/>
                  <div className="sprint-review__card">
                    <SprintReview  sprint_review_id={sprint_review.id} />
                    <button className="button button--danger sprint_sidebar--button" onClick={this.onDelete}>delete</button>
                  </div>
                </EditableProperty>
              }
              { ! sprint_review_id && can_edit &&  
                <EditableProperty property_key={'sprint_review_'+sprint_id}
                                  initial_value=''
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                                  edit_as_modal={true}
                                  actionLabel="Edit Sprint Review Cycle Days"
                    >
                  <SprintReviewForm form={'sprint_review_form_'+sprint_id}
                                    sprint_id={sprint_id} />
                  <div className="text-component--readonly"></div>
                  <div className="text-component--empty">
                    <button className="button button--primary sprint_sidebar--button">Create review</button>
                  </div>
                </EditableProperty>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_review_id, sprint_id } = props
    const sprint_review = (sprint_review_id && getSprintReview(state, sprint_review_id)) || {}
    const sprint = (sprint_id && getSprint(state, sprint_id)) || {}
    const can_view = has_permission(state, sprint.project_id, 'has_view_review_cycle')
    const can_edit = has_permission(state, sprint.project_id, 'has_edit_review_cycle')

    return {
        sprint_review_id,
        sprint_review,
        sprint_id,
        sprint,
        can_edit,
        can_view
    }
}

export default connect(mapStateToProps)(EditableSprintReviewCycle)

import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import SprintReviewCycleForm from './form/SprintReviewCycleForm'
import { updateSprintReviewCycle, getSprint } from '../actions/Sprints'

class EditableSprintReviewCycle extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, sprint_ids } = this.props
        dispatch(updateSprintReviewCycle(sprint_ids, new_value.review_every_num_days))
    }

    render() {
        const { sprint } = this.props

        return (
            <EditableProperty property_key='review_every_num_days'
                              initial_value={sprint.review_every_num_days}
                              onChange={this.onChange}
                              can_edit={true}
                              edit_as_modal={true}
                              actionLabel="Edit Sprint Review Cycle Days"
            >
              <SprintReviewCycleForm />
              <div className="text-component--readonly">{sprint.review_every_num_days}</div>
              <div className="text-component--empty">Not set</div>
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_ids } = props
    let sprint_id = null
    if ( sprint_ids && sprint_ids.length > 0 ) {
        sprint_id = sprint_ids[0]
    }
    const sprint = (sprint_id && getSprint(state, sprint_id)) || {}

    return {
        sprint_ids,
        sprint
    }
}

export default connect(mapStateToProps)(EditableSprintReviewCycle)

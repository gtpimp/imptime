import React, {Component} from 'react'
import {connect} from 'react-redux'
import Sidebar from './Sidebar'
import {ensureSprintsLoaded, getSprints} from '../actions/Sprints'
import PropertyStackComponent from '../components/PropertyStackComponent'
import EditableSprintReviewCycle from '../components/EditableSprintReviewCycle'
import { has_permission } from '../actions/Users'

class MultipleSprintSidebar extends Component {

    componentDidMount() {
        const {sprint_ids, dispatch} = this.props
        dispatch(ensureSprintsLoaded(sprint_ids))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch} = this.props
        dispatch(ensureSprintsLoaded(new_props.sprint_ids))
    }

    render() {

        const {sprints, sprint_ids, sprint, has_edit_review_cycle_permission} = this.props

        return (

            <Sidebar>

              <div>
                { sprints.length } sprints selected
              </div>

              { has_edit_review_cycle_permission &&
                <PropertyStackComponent title="Review cycle">
                  <EditableSprintReviewCycle sprint_ids={sprint_ids}/>
                </PropertyStackComponent>
              }

              
            </Sidebar>
        )
    }
}

function mapStateToProps(state, props) {
    const {sprint_ids, project_id} = props
    const sprints = getSprints(state, sprint_ids) || []
    let sprint = null
    if ( sprints && sprints.length > 0 ) {
        sprint = sprints[0]
    }
    const has_edit_review_cycle_permission = has_permission(state, project_id, "has_edit_review_cycle")
    return {
        sprints: sprints || [],
        sprint,
        sprint_ids,
        project_id,
        has_edit_review_cycle_permission
    }
}

export default connect(mapStateToProps)(MultipleSprintSidebar)

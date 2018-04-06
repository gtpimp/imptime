import React, {Component} from 'react'
import {connect} from 'react-redux'
import { has_permission } from '../actions/Users'
import { getSprint, ensureSprintsLoaded, is_sprint_invalidated } from '../actions/Sprints'

class SprintRatios extends Component {

    componentDidMount() {
        this.refresh()
    }
    
    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }
    
    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, sprint_id} = props
        dispatch(ensureSprintsLoaded([sprint_id]))
    }
    
    render() {
        const { sprint } = this.props

        return (
            <div className="sprint-ratios">
              <div>
                Ratio of testing: {sprint.ratio_testing}
              </div>
              <div>
                Ratio of management: {sprint.ratio_management}
              </div>
              <div>
                Ratio of scope creep: {sprint.ratio_scope_creep}
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id } = props

    const sprint = getSprint(state, sprint_id) || {}
    const can_view = has_permission(state, sprint.project_id, "has_view_velocity")
    const is_invalidated = is_sprint_invalidated(state, sprint_id)
    
    return {
        sprint,
        can_view,
        is_invalidated
    }
}

export default connect(mapStateToProps)(SprintRatios)

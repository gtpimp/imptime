import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import SprintName from '../components/SprintName'
import Timestamp from './Timestamp'
import { has_permission } from '../actions/Users'
import { getSprintSnapshot, ensureSprintSnapshotsLoaded } from '../actions/SprintSnapshots'
import BreakdownSummary from './BreakdownSummary'

class SprintSnapshotPage extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.sprint_snapshot_id !== this.props.sprint_snapshot_id) {
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, sprint_snapshot_id } = props
        dispatch(ensureSprintSnapshotsLoaded([sprint_snapshot_id]))
    }

    renderSnapshot() {
        const { sprint_snapshot } = this.props
        return (
            <div>
              Snapshot {sprint_snapshot.description} taken on
              <Timestamp value={sprint_snapshot.created_at} format="dateshort-time" />
              { sprint_snapshot && sprint_snapshot.cost_summary && 
                <BreakdownSummary summary={sprint_snapshot.cost_summary.breakdown} />
              }
            </div>
        )
    }
    
    render() {

        const { sprint_id, sprint_snapshot } = this.props
        
        return (
            <div>
              <h2>
                <SprintName sprint_id={sprint_id} />
              </h2>
              <div>
                { sprint_snapshot && this.renderSnapshot() }
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const sprint_snapshot_id = props.match.params.snapshotId
    const sprint_snapshot = getSprintSnapshot(state, sprint_snapshot_id) || {}
    const sprint_id = sprint_snapshot && sprint_snapshot.sprint_id
    const project_id = sprint_snapshot && sprint_snapshot.project_id
    const can_view_budget = project_id && has_permission(state, project_id, 'has_view_budget')
    const can_view_commission = can_view_budget
    
    return {
        sprint_snapshot_id,
        sprint_snapshot,
        project_id,
        sprint_id,
        can_view_budget,
        can_view_commission
    }
}

export default withRouter(connect(mapStateToProps)(SprintSnapshotPage))

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { setSprintBreadcrumbsHelper, setBreadcrumbs } from '../actions/Breadcrumbs'
import { has_permission } from '../actions/Users'
/* import {
 *     PAGE_KEY__SPRINT_SNAPSHOT_PAGE,
 * } from '../actions/ItemListKeyRegistry'*/
// import { set_toolbars } from '../actions/Page'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import { getSprintSnapshot, ensureSprintSnapshotsLoaded } from '../actions/SprintSnapshots'
import SprintSnapshot from '../components/SprintSnapshot'

class SprintSnapshotPage extends Component {

    componentDidMount() {
        const {sprint_id, project_id, sprint_snapshot_id, dispatch} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureSprintSnapshotsLoaded([sprint_snapshot_id]))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { sprint_id, project_id, sprint_snapshot_id, dispatch } = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureSprintSnapshotsLoaded([sprint_snapshot_id]))

        if ( (new_props.project && (!this.props.project || new_props.project.id !== this.props.project.id)) ||
             (new_props.sprint && (!this.props.sprint || new_props.sprint.id !== this.props.sprint.id)) ||
             (new_props.sprint_snapshot && (!this.props.sprint_snapshot || new_props.sprint_snapshot.id !== this.props.sprint_snapshot.id)) ) {
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch,
                project, project_id,
                sprint, sprint_id,
                sprint_snapshot, sprint_snapshot_id } = props

        if ( project && sprint && sprint_snapshot ) {
            const auto_set=false
            const breadcrumbs = setSprintBreadcrumbsHelper(project, sprint, auto_set)
            breadcrumbs.push({to: '/projects/'+project_id+'/sprints/'+sprint_id+'/snapshots/'+sprint_snapshot_id,
                              label: sprint_snapshot.description,
                              type: 'sprint_snapshot',
                              selected_entities: {project: project,
                                                  sprint: sprint,
                                                  sprint_snapshot: sprint_snapshot}})
            dispatch(setBreadcrumbs(breadcrumbs))
        }
    }
    
    render() {

        const { sprint_snapshot_id } = this.props
        
        return (
            <div>
              <SprintSnapshot sprint_snapshot_id={sprint_snapshot_id} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.match.params.projectId
    const sprint_id = props.match.params.sprintId
    const sprint_snapshot_id = props.match.params.snapshotId
    const project = getProject(state, project_id)
    const sprint = getSprint(state, sprint_id)
    const sprint_snapshot = getSprintSnapshot(state, sprint_snapshot_id)
    const can_view_budget = has_permission(state, project_id, 'has_view_budget')
    const can_view_commission = can_view_budget
    
    return {
        project_id,
        project,
        sprint_id,
        sprint,
        sprint_snapshot_id,
        sprint_snapshot,
        can_view_budget,
        can_view_commission
    }
}

export default withRouter(connect(mapStateToProps)(SprintSnapshotPage))

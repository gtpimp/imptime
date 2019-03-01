import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { setSprintBreadcrumbsHelper } from '../actions/Breadcrumbs'
import SprintTimeSummary from '../components/SprintTimeSummary'
//import '../sass/sprint-dashboard.scss'
import {
    PAGE_KEY__SPRINT_DASHBOARD_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    setPageSelectedEntities
} from '../actions/Page'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded,
        getSprint
} from '../actions/Sprints'

class ProjectDashboardPage extends Component {

    componentDidMount() {
        const {sprint_id, project_id, sprint, project, dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__SPRINT_DASHBOARD_PAGE, ['sprint-dashboard']))
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        this.refresh(sprint, project)
    }

    componentWillReceiveProps(new_props) {
        const { sprint_id, project_id, dispatch } = this.props

        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))

        if ( new_props.sprint.id !== this.props.sprint.id ||
             new_props.sprint.name !== this.props.sprint.name ||
             new_props.project.name !== this.props.project.name) {
            this.refresh(new_props.sprint, new_props.project)
        }
    }

    refresh(sprint, project) {
        const { dispatch, project_id } = this.props
        dispatch(setSprintBreadcrumbsHelper(project, sprint))
        dispatch(setPageSelectedEntities(PAGE_KEY__SPRINT_DASHBOARD_PAGE,
                                 {project_ids: [project_id],
                                  sprint_ids: [sprint.id]}))
    }

    render() {

        const { sprint, sprint_id, project_id } = this.props
        
        return (
            <div>
              <h2 className="header">
                Sprint dashboard for {sprint.name}
              </h2>
              <SprintTimeSummary sprint_id={sprint_id} project_id={project_id} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.match.params.projectId
    const sprint_id = props.match.params.sprintId
    const project = getProject(state, project_id) || {}
    const sprint = getSprint(state, sprint_id) || {}

    return {
        project_id: project_id,
        project: project,
        sprint_id: sprint_id,
        sprint: sprint
    }
}

export default withRouter(connect(mapStateToProps)(ProjectDashboardPage))

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { setSprintBreadcrumbsHelper } from '../actions/Breadcrumbs'
import EditableSprintName from '../components/EditableSprintName.js'
import PropertyStackComponent from '../components/PropertyStackComponent'
import SprintTimeSummary from '../components/SprintTimeSummary'
//import '../sass/sprint-rate.scss'
import {
    PAGE_KEY__SPRINT_RATE_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    select_sprints
} from '../actions/Page'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded,
        getSprint
} from '../actions/Sprints'

class SprintRatePage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {sprint_id, project_id, sprint, project, dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__SPRINT_RATE_PAGE, ['sprint-rate']))
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
        const { dispatch } = this.props
        dispatch(setSprintBreadcrumbsHelper(project, sprint))
        dispatch(select_sprints(PAGE_KEY__SPRINT_RATE_PAGE, [sprint.id]))
    }

    render() {

        const { sprint, sprint_id, project_id } = this.props
        
        return (
            <div>
              <h2 className="header">
                Rates for {sprint.name}
              </h2>
              <SprintTimeSummary sprint_id={sprint_id} project_id={project_id} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.params.projectId
    const sprint_id = props.params.sprintId
    const project = getProject(state, project_id) || {}
    const sprint = getSprint(state, sprint_id) || {}

    return {
        project_id: project_id,
        project: project,
        sprint_id: sprint_id,
        sprint: sprint
    }
}

export default connect(mapStateToProps)(SprintRatePage)

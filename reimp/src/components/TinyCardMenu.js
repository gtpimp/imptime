import React, {Component} from 'react'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'
import TinyCard from './TinyCard'
import TinyCardRow from './TinyCardRow'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import { setSprintBreadcrumbsHelper } from '../actions/Breadcrumbs'

class TinyCardMenu extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {sprint_id, sprint, project_id, project, dispatch} = this.props
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
    }

    render() {
        const { project_name, sprint_name } = this.props
        return (
            <TinyCard title="Cards" project_name={project_name} sprint_name={sprint_name} >
              <TinyCardRow>
                <Link to="./cards/budget">Budget</Link>
              </TinyCardRow>
              <TinyCardRow>
                <Link to="./cards/issues_per_status">Issues By Status</Link>
              </TinyCardRow>
            </TinyCard>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.match.params.projectId
    const sprint_id = props.match.params.sprintId
    const sprint = getSprint(state, sprint_id) || {}
    const project = getProject(state, project_id) || {}
    const sprint_name = sprint.name
    const project_name = project.name

    return {
        project_id,
        sprint_id,
        sprint,
        project,
        sprint_name,
        project_name
    }
}

export default withRouter(connect(mapStateToProps)(TinyCardMenu))


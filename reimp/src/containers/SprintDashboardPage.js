import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {
    PAGE_KEY__SPRINT_DASHBOARD_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    select_sprints
} from '../actions/Page'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'

class ProjectDashboardPage extends Component {

    constructor(props) {
        super(props)
        this.navigateToIssuesPage = this.navigateToIssuesPage.bind(this)
    }

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
             new_props.sprint.name != this.props.sprint.name ||
             new_props.project.name != this.props.project.name) {
            this.refresh(new_props.sprint, new_props.project)
        }
    }

    refresh(sprint, project) {
        const { dispatch } = this.props
        dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'},
                                  {to: '/projects/'+project.id, label: project.name},
                                  {to: '/projects/'+project.id+'/sprints', label: 'All Sprints'},
                                  {to: '/projects/'+project.id+'/sprints/'+sprint.id, label: sprint.name} ]))
        dispatch(select_sprints(PAGE_KEY__SPRINT_DASHBOARD_PAGE, [sprint.id]))
    }

    navigateToIssuesPage() {
        const { project_id, sprint_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_id+'/issues');
    }
    
    render() {

        const { sprint } = this.props
        
        return (
            <div>
                Sprint {sprint.name}

                <pre>
                    I am your sprint dashboard
                </pre>
                
                <button onClick={this.navigateToIssuesPage}>Take me to your issues</button>
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

export default connect(mapStateToProps)(ProjectDashboardPage)


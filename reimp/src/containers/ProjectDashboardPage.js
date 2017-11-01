import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import ProjectUsers from '../components/ProjectUsers'
import {
    PAGE_KEY__PROJECT_DASHBOARD_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    select_projects,
} from '../actions/Page'
import ProjectDashboard from '../components/ProjectDashboard'

class ProjectDashboardPage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {dispatch, project_id} = this.props
        dispatch(set_toolbars(PAGE_KEY__PROJECT_DASHBOARD_PAGE, ['project-dashboard']))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { project_id } = this.props
        if ( new_props.loaded !== this.props.loaded ||
             new_props.project_id !== project_id ||
             new_props.project.id !== this.props.project.id ) {
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, project_id, project } = props
        if ( project.id ) {
            dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'},
                                      {to: '/projects/'+project_id, label: project.name} ]))
        }
        dispatch(select_projects(PAGE_KEY__PROJECT_DASHBOARD_PAGE, [project_id]))
        dispatch(ensureProjectsLoaded([project_id]))
    }

    render() {

        const { project } = this.props

        return (
            <div>
              <ProjectDashboard project_id={project.id} />
              <br/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.params.projectId
    const project = getProject(state, project_id) || {}
    return {
        project_id: project_id,
        project: project,
        loaded: project.name
    }
}

export default connect(mapStateToProps)(ProjectDashboardPage)

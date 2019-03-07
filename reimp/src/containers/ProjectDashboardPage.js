import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { setProjectBreadcrumbsHelper } from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {
    PAGE_KEY__PROJECT_DASHBOARD_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    setPageSelectedEntities
} from '../actions/Page'
import ProjectDashboard from '../components/ProjectDashboard'

class ProjectDashboardPage extends Component {

    componentDidMount() {
        const {dispatch} = this.props
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
            dispatch(setProjectBreadcrumbsHelper(project))
        }
        dispatch(setPageSelectedEntities(PAGE_KEY__PROJECT_DASHBOARD_PAGE,
                                 {project_ids:[project_id]}))
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
    const project_id = props.match.params.projectId
    const project = getProject(state, project_id) || {}
    return {
        project_id: project_id,
        project: project,
        loaded: project.name
    }
}

export default withRouter(connect(mapStateToProps)(ProjectDashboardPage))

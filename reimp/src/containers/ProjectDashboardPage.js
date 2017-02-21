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

class ProjectDashboardPage extends Component {

    constructor(props) {
        super(props)
        this.navigateToSprintsPage = this.navigateToSprintsPage.bind(this)
    }

    componentDidMount() {
        const {dispatch, project_id} = this.props
        dispatch(set_toolbars(PAGE_KEY__PROJECT_DASHBOARD_PAGE, ['project-dashboard']))
        this.refresh(project_id)
    }

    componentWillReceiveProps(new_props) {
        const { project_id } = this.props
        if ( new_props.project_id !== project_id || new_props.project.id !== this.props.project.id ) {
            this.refresh(new_props.project_id)
        }
    }
    
    refresh(project_id) {
        const { dispatch, project } = this.props
        dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'},
                                  {to: '/projects/'+project_id, label: project.name} ]))
        dispatch(select_projects(PAGE_KEY__PROJECT_DASHBOARD_PAGE, [project_id]))
        dispatch(ensureProjectsLoaded([project_id]))
    }

    navigateToSprintsPage() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints');
    }
    
    render() {

        const { project } = this.props
        
        return (
            <div>
                Project {project.name}

                <button onClick={this.navigateToSprintsPage}>Take me to your sprints</button>
                <br/>
                
                <div className="project-dashboard__project_users">
                    <ProjectUsers project_id={project.id} />
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.params.projectId
    const project = getProject(state, project_id)
    return {
        project_id: project_id,
        project: project || {}
    }
}

export default connect(mapStateToProps)(ProjectDashboardPage)


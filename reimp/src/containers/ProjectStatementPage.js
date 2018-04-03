import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {setProjectBreadcrumbsHelper} from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureUsersLoaded, getUser} from '../actions/Users'
import ProjectStatement from '../components/ProjectStatement'
import Modal from 'react-modal';
import {
    PAGE_KEY__PROJECT_USER_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    select_projects,
    select_users
} from '../actions/Page'

class ProjectStatementPage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {dispatch, project_id, user_id} = this.props
        this.refresh(project_id, user_id, null, null)
    }

    componentWillReceiveProps(new_props) {
        const { project_id, user_id, dispatch } = this.props
        if ( new_props.project_id !== project_id || new_props.project.id !== this.props.project.id ) {
            this.refresh(new_props.project_id, new_props.project)
        }
    }
    
    refresh(project_id, project, user) {
        const { dispatch } = this.props
        const breadcrumbs = []
        project = project || {}
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            dispatch(select_projects(PAGE_KEY__PROJECT_USER_PAGE, [project_id]))
            if ( project.id ) {
                dispatch(setProjectBreadcrumbsHelper(project))
            }
        }
    }

    render() {
        const { project } = this.props
        const that = this
        return (
            <div className="project-user__project_statement">
              <h2>
                Project statement for {project.name}
              </h2>
              <ProjectStatement
                 project_id={project.id}
                 />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.match.params.projectId
    const project = getProject(state, project_id)
 
    const opts = props.location.query
        
    return {
        project_id: project_id,
        project: project || {}
    }
}

export default withRouter(connect(mapStateToProps)(ProjectStatementPage))

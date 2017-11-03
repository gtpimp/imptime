import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
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
            breadcrumbs.push({to: '/projects', label: 'Projects'})
            if ( project_id === project.id ) {
                breadcrumbs.push({to: '/projects/'+project_id, label: project.name})
            }
        }
        dispatch(setBreadcrumbs(breadcrumbs))
    }

    render() {
        const { project } = this.props
        const that = this
        return (
            <div className="project-user__project_statement">
              <ProjectStatement
                 project_id={project.id}
                 />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.params.projectId
    const project = getProject(state, project_id)
 
    const opts = props.location.query
        
    return {
        project_id: project_id,
        project: project || {}
    }
}

export default connect(mapStateToProps)(ProjectStatementPage)

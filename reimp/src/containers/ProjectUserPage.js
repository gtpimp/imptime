import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureUsersLoaded, getUser} from '../actions/Users'
import ProjectUsers from '../components/ProjectUsers'
import UserPermissions from '../components/UserPermissions'
import Modal from 'react-modal';
import {
    PAGE_KEY__PROJECT_USER_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    select_projects,
    select_users,
    setPageFlag,
    clearPageFlag,
    getPageFlag
} from '../actions/Page'

class ProjectUserPage extends Component {

    constructor(props) {
        super(props)
        this.navigateToSprintsPage = this.navigateToSprintsPage.bind(this)
        this.navigateToProjectUserPermissions = this.navigateToProjectUserPermissions.bind(this)
        this.closeProjectUserPermissions = this.closeProjectUserPermissions.bind(this)
    }

    componentDidMount() {
        const {dispatch, project_id, user_id} = this.props
        // dispatch(set_toolbars(PAGE_KEY__PROJECT_USER_PAGE, ['project-user']))
        this.refresh(project_id, user_id, null, null)
    }

    componentWillReceiveProps(new_props) {
        const { project_id, user_id, dispatch } = this.props
        if ( new_props.project_id !== project_id || new_props.project.id !== this.props.project.id ||
             new_props.user_id !== user_id || new_props.user.id != this.props.user.id) {
            this.refresh(new_props.project_id, new_props.user_id, new_props.project, new_props.user)
        }
    }
    
    refresh(project_id, user_id, project, user) {
        const { dispatch } = this.props
        const breadcrumbs = []
        project = project || {}
        user = user || {}
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            dispatch(select_projects(PAGE_KEY__PROJECT_USER_PAGE, [project_id]))
            breadcrumbs.push({to: '/projects', label: 'All Projects'})
            if ( project_id === project.id ) {
                breadcrumbs.push({to: '/projects/'+project_id, label: project.name})
            }
            if ( user_id ) {
                dispatch(ensureUsersLoaded([user_id]))
                breadcrumbs.push({to: '/projects/'+project_id+'/users', label: 'All Users'})
                if ( user_id === user.id ) {
                    breadcrumbs.push({to: '/projects/'+project_id+'/users/'+user_id, label: user.username})
                }
                dispatch(select_users(PAGE_KEY__PROJECT_USER_PAGE, [project_id]))
            }
        }
        dispatch(setBreadcrumbs(breadcrumbs))
    }

    navigateToSprintsPage() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints');
    }

    navigateToProjectUserPermissions(user, event) {
        const { project_id } = this.props
        event.stopPropagation()
        event.preventDefault()
        browserHistory.push('/projects/'+project_id+'/users/'+user.id+'/?permissions=1')
    }

    closeProjectUserPermissions() {
        const { user_id, project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/users/'+user_id+'/?permissions=0')
    }

    renderUserPermissions() {
        const { project_id, user_id } = this.props
        const that = this
        return (
            <div className="project-user__user_permissions">
                <UserPermissions project_id={project_id}
                                 user_id={user_id}
                                 onClose={that.closeProjectUserPermissions} />
            </div>
        )
    }
    
    render() {
        const { project, user_id, show_permissions } = this.props
        const that = this
        return (
            <div>
                { show_permissions && user_id && this.renderUserPermissions() }

                { ! show_permissions &&
                  <div>
                      <div className="project-user__project_users">
                          <ProjectUsers
                              project_id={project.id}
                              onPermissionsAction={that.navigateToProjectUserPermissions}
                          />
                      </div>
                  </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.params.projectId
    const user_id = props.params.userId
    const project = getProject(state, project_id)
    const user = getUser(state, user_id)

    const opts = props.location.query
        
    return {
        project_id: project_id,
        project: project || {},
        user_id: user_id,
        user: user || {},
        show_permissions: opts.permissions === '1',
        username: (user || {}).username
    }
}

export default connect(mapStateToProps)(ProjectUserPage)

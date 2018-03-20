import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { setProjectUserBreadcrumbsHelper } from '../actions/Breadcrumbs'
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
            if ( user_id ) {
                dispatch(ensureUsersLoaded([user_id]))
                dispatch(select_users(PAGE_KEY__PROJECT_USER_PAGE, [project_id]))
            }
            dispatch(select_projects(PAGE_KEY__PROJECT_USER_PAGE, [project_id]))
            dispatch(setProjectUserBreadcrumbsHelper(project, user))
        }
    }

    navigateToProjectUserPermissions(user, event) {
        const { project_id } = this.props
        event.stopPropagation()
        event.preventDefault()
        browserHistory.push('/projects/'+project_id+'/users/'+user.id + '/permissions')
    }

    closeProjectUserPermissions() {
        const { user_id, project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/users/')
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
        const { project, user_id, view_mode, show_permissions } = this.props
        const that = this
        return (
            <div>
              { view_mode === 'permissions' && this.renderUserPermissions() }

              { view_mode === 'list' &&
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
    const view_mode = props.params.viewMode || 'list'
    const project = getProject(state, project_id)
    const user = getUser(state, user_id)

    const opts = props.location.query
        
    return {
        project_id,
        project: project || {},
        user_id,
        view_mode,
        user: user || {},
        username: (user || {}).username
    }
}

export default connect(mapStateToProps)(ProjectUserPage)

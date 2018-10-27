import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { setProjectUserBreadcrumbsHelper } from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureUsersLoaded, getUser} from '../actions/Users'
import ProjectUsers from '../components/ProjectUsers'
import ProjectUserPermissions from '../components/ProjectUserPermissions'
import {
    PAGE_KEY__PROJECT_USER_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    select_projects,
    select_users,
} from '../actions/Page'

class ProjectUserPage extends Component {

    constructor(props) {
        super(props)
        this.navigateToProjectUserPermissions = this.navigateToProjectUserPermissions.bind(this)
        this.closeProjectUserPermissions = this.closeProjectUserPermissions.bind(this)
    }

    componentDidMount() {
        // dispatch(set_toolbars(PAGE_KEY__PROJECT_USER_PAGE, ['project-user']))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { project_id, user_id } = this.props
        if ( new_props.project_id !== project_id || new_props.project.id !== this.props.project.id ||
             new_props.user_id !== user_id || new_props.user.id !== this.props.user.id) {
            this.refresh(new_props)
        }
    }
    
    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, project_id, user_id, project, user } = props
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            if ( user_id ) {
                dispatch(ensureUsersLoaded([user_id]))
                dispatch(select_users(PAGE_KEY__PROJECT_USER_PAGE, [project_id]))
            }
            dispatch(select_projects(PAGE_KEY__PROJECT_USER_PAGE, [project_id]))
        }
        if ( project && project.id ) {
            dispatch(setProjectUserBreadcrumbsHelper(project, user))
        }
    }

    navigateToProjectUserPermissions(user, event) {
        const { project_id, history } = this.props
        event.stopPropagation()
        event.preventDefault()
        history.push('/projects/'+project_id+'/users/'+user.id + '/permissions')
    }

    closeProjectUserPermissions() {
        const { project_id, history } = this.props
        history.push('/projects/'+project_id+'/users/')
    }

    renderUserPermissions() {
        const { project_id, user_id } = this.props
        const that = this
        return (
            <div className="project-user__user_permissions">
              <ProjectUserPermissions project_id={project_id}
                                      user_id={user_id}
                                      onClose={that.closeProjectUserPermissions} />
            </div>
        )
    }
    
    render() {
        const { project, view_mode } = this.props
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
    const project_id = props.match.params.projectId
    const user_id = props.match.params.userId
    const view_mode = props.match.params.viewMode || 'list'
    const project = getProject(state, project_id)
    const user = getUser(state, user_id)
        
    return {
        project_id,
        project: project || {},
        user_id,
        view_mode,
        user: user || {},
        username: (user || {}).username
    }
}

export default withRouter(connect(mapStateToProps)(ProjectUserPage))

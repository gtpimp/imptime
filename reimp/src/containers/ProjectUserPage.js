import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureUsersLoaded, getUser} from '../actions/Users'
import ProjectUsers from '../components/ProjectUsers'
import UserPermission from '../components/UserPermission'
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
import {
    setProjectUserPermission,
    unsetProjectUserPermission
} from '../actions/ProjectUserPermissions'

class ProjectUserPage extends Component {

    constructor(props) {
        super(props)
        this.navigateToSprintsPage = this.navigateToSprintsPage.bind(this)
        this.navigateToProjectUserPermissions = this.navigateToProjectUserPermissions.bind(this)
        this.closeProjectUserPermissions = this.closeProjectUserPermissions.bind(this)
        this.onChangePermission = this.onChangePermission.bind(this)
    }

    componentDidMount() {
        const {dispatch, project_id, user_id} = this.props
        // dispatch(set_toolbars(PAGE_KEY__PROJECT_USER_PAGE, ['project-user']))
        this.refresh(project_id, user_id)
    }

    componentWillReceiveProps(new_props) {
        const { project_id, user_id, dispatch } = this.props
        if ( new_props.project_id !== project_id || new_props.project.id !== this.props.project.id ||
             new_props.user_id !== user_id || new_props.user.id != this.props.user.id) {
            this.refresh(new_props.project_id, new_props.user_id)
        }
    }
    
    refresh(project_id, user_id) {
        const { dispatch } = this.props
        const breadcrumbs = []
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            const project = getProject(project_id) || {}
            breadcrumbs.push({to: '/projects', label: 'All Projects'})
            breadcrumbs.push({to: '/projects/'+project_id, label: project.name})
            dispatch(select_projects(PAGE_KEY__PROJECT_USER_PAGE, [project_id]))
            if ( user_id ) {
                dispatch(ensureUsersLoaded([user_id]))
                const user = getUser(user_id) || {}
                breadcrumbs.push({to: '/projects/'+project_id+'/users', label: 'All Users'})
                breadcrumbs.push({to: '/projects/'+project_id+'/users/'+user_id, label: user.username})
                dispatch(select_users(PAGE_KEY__PROJECT_USER_PAGE, [project_id]))
            }
        }
    }

    navigateToSprintsPage() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints');
    }

    navigateToProjectUserPermissions(event) {
        const { user_id, project_id } = this.props
        event.stopPropagation()
        event.preventDefault()
        browserHistory.push('/projects/'+project_id+'/users/'+user_id+'?permissions=1')
    }

    closeProjectUserPermissions() {
        const { user_id, project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/users/'+user_id+'?permissions=0')
    }

    onChangePermission(new_values) {
        const { user_id, project_id, dispatch } = this.props

        // setProjectUserPermission,
        // unsetProjectUserPermission

        debugger
        dispatch(setProjectUserPermission(project_id, user_id))
    }

    renderUserPermissions() {
        const { project_id, user_id } = this.props
        const that = this
        return (
            <div className="project-user__user_permissions">
                <UserPermission project_id={project_id}
                                user_id={user_id}
                                onClose={that.closeProjectUserPermissions}
                                onChange={that.onChangePermission} />
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
                      Users for project: {project.name}
                      <br/>
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
        show_permissions: opts.permissions === '1'
    }
}

export default connect(mapStateToProps)(ProjectUserPage)

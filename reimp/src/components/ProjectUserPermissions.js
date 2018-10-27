import React, { Component } from 'react'
import { connect } from 'react-redux'
import {withRouter} from 'react-router-dom'
import keys from 'lodash/keys'
import map from 'lodash/map'
import filter from 'lodash/filter'
import ProjectUserPermissionForm from './form/ProjectUserPermissionForm'
import { getUser, ensureUsersLoaded, logged_in_users_permissions } from '../actions/Users'
import { getProject, ensureProjectsLoaded } from '../actions/Projects'
import {
    getProjectUserPermission,
    ensureProjectUserPermissionsLoaded,
    updateProjectUserPermissions
} from '../actions/ProjectUserPermissions'
import '../sass/user-permission.css'

class ProjectUserPermissions extends Component {

    constructor(props) {
        super(props)
        this.onChangePermission = this.onChangePermission.bind(this)
        this.onRemoveUser = this.onRemoveUser.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.user_id !== this.props.user_id || new_props.project_id !== this.props.project_id ||
             new_props.user.id !== this.props.user.id || new_props.project.id !== this.props.project.id ) {
            this.refresh(new_props.project_id, new_props.user_id, new_props.user, new_props.project)
        }
    }

    refresh(project_id, user_id, user, project) {
        const {dispatch} = this.props
        user = user || {}
        project = project || {}
        project_id = project_id || this.props.project_id
        user_id = user_id || this.props.user_id
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureUsersLoaded([user_id]))
        dispatch(ensureProjectUserPermissionsLoaded(project_id, user_id))
    }

    onChangePermission(new_values) {
        const { user_id, project_id, dispatch } = this.props

        const permission_values = {}
        map(keys(new_values), (permission_name) => permission_values[permission_name] = new_values[permission_name] === true)

        dispatch(updateProjectUserPermissions(project_id, user_id, permission_values))
    }

    onRemoveUser() {
        const { project_id, history } = this.props
        history.push('/projects/'+project_id+'/users/')
    }

    render() {
        const { user, project, is_loading,
                permission_names, logged_in_users_permissions } = this.props

        return (
            <div className="user-permission">

                <h2>Permissions for {user.username} in project {project.name}</h2>

	                { is_loading &&
                          <div>Loading...</div>
                        }

                        { !is_loading && ! logged_in_users_permissions.has_view_permissions &&
                          <div>You are not allowed to view permissions</div>
                        }

                        { !is_loading && logged_in_users_permissions.has_view_permissions &&

                          <ProjectUserPermissionForm permission_names={permission_names}
                                                     user_id={user.id}
                                                     project_id={project.id}
                                                     onRemoveUser={this.onRemoveUser}
                                                     onSave={this.onChangePermission} />
                        }

            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id, user_id, onChange } = props
    const user = getUser(state, user_id) || {}
    const project = getProject(state, project_id) || {}
    const pup = getProjectUserPermission(state, project_id, user_id) || {}

    const permission_names = filter(keys(pup), function(o) { return o.startsWith("has_") || o.startsWith('is_') })
    const is_loading = ( ! user.id || ! project.id || ! pup.id )
    
    return {
        logged_in_users_permissions: logged_in_users_permissions(state, project_id),
        onChange: onChange,
        project: project,
        project_id: project_id,
	user: user,
	user_id: user_id,
        pup: pup,
        pup_id: pup.id,
        is_loading: is_loading,
        permission_names: permission_names
    }
}

export default withRouter(connect(mapStateToProps)(ProjectUserPermissions))

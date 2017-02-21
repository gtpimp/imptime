import React, { Component } from 'react'
import { connect } from 'react-redux'
import keys from 'lodash/keys'
import map from 'lodash/map'
import filter from 'lodash/filter'
import classNames from 'classnames'
import { getUser, ensureUsersLoaded } from '../actions/Users'
import { getProject, ensureProjectsLoaded } from '../actions/Projects'
import { getProjectUserPermission, ensureProjectUserPermissionsLoaded } from '../actions/ProjectUserPermissions'
import '../sass/user-permission.css'

class UserPermission extends Component {

    ensureProjectUserPermissionsLoaded

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props.project_id, new_props.user_id)
    }

    refresh(project_id, user_id) {
        const {dispatch} = this.props
        project_id = project_id || this.props.project_id
        user_id = user_id || this.props.user_id
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureUsersLoaded([user_id]))
        dispatch(ensureProjectUserPermissionsLoaded(project_id, user_id))
    }
    
    render() {
        const { user, project, pup, is_loading, permission_names } = this.props

        return (
            <div className="user-permission">

                <h2>Permissions for {user.username} in project {project.name}</h2>
                
	        { is_loading &&
                  <tr><td>Loading...</td></tr>
                }

                { ! pup.has_view_permissions &&
                  <tr><td>You are not allowed to view permissions</td></tr>
                }
                
                { !is_loading && pup.has_view_permissions &&
                  map(permission_names, (permission_name, index) =>
                       <tr key={index}>
                           <td>
                               <div>
                                   <div className="user-permission__permission_name" key={index}>{permission_name.replace(/_/g, " ")}</div>
                               </div>
                           </td>
                           <td>
                               <div>
                                   {pup[permission_name] === true &&
                                    <div className="user-permission__permission_value--on">On</div>
                                   }
                                   {pup[permission_name] === false &&
                                    <div className="user-permission__permission_value--off">Off</div>
                                   }
                               </div>
                           </td>
                       </tr>
                  )
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id, user_id, onClose } = props
    const user = getUser(state, user_id) || {}
    const project = getProject(state, project_id) || {}
    const pup = getProjectUserPermission(state, project_id, user_id) || {}

    const permission_names = filter(keys(pup), function(o) { return o.startsWith("has_") || o.startsWith("is_") })
    const is_loading = ( ! user.id || ! project.id || ! pup.id )
    
    return {
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

export default connect(mapStateToProps)(UserPermission)

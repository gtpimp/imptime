import React, { Component } from 'react'
import { connect } from 'react-redux'
import keys from 'lodash/keys'
import map from 'lodash/map'
import filter from 'lodash/filter'
import classNames from 'classnames'
import { reduxForm, Field } from 'redux-form';
import { getUser, ensureUsersLoaded, logged_in_users_permissions } from '../actions/Users'
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

    renderPermissionCheckbox(permission_name) {
        return <input type="text" label={permission_name} key={permission_name} />
    }

    render() {
        const { user, project, pup, is_loading,
                permission_names, handleSubmit, logged_in_users_permissions } = this.props

        return (
            <div className="user-permission">

                <h2>Permissions for {user.username} in project {project.name}</h2>

                <table>
                    <tbody>
                        
	                { is_loading &&
                          <tr><td>Loading...</td></tr>
                        }

                        { ! logged_in_users_permissions.has_view_permissions &&
                          <tr><td>You are not allowed to view permissions</td></tr>
                        }

                        { !is_loading && logged_in_users_permissions.has_view_permissions &&
                          map(permission_names, (permission_name, index) =>
                              <tr key={index}>
                                  <td>
                                      <div>
                                          <div className="user-permission__permission_name" key={index}>{permission_name.replace(/_/g, " ")}</div>
                                      </div>
                                  </td>
                                  <td>
                                      <div>
                                          { logged_in_users_permissions.has_edit_permissions &&
                                            <form onSubmit={(new_values) => handleSubmit(permission_name, new_values)}>
                                                <Field name={permission_name}
                                                       component={() => this.renderPermissionCheckbox(permission_name)}
                                                       onChange={(new_values) => handleSubmit(new_values)} />
                                            </form>
                                          }
                                           { ! logged_in_users_permissions.has_edit_permissions &&
                                             <div>
                                                 {pup[permission_name] === true &&
                                                  <div className="user-permission__permission_value--on">On</div>
                                                 }
                                                 {pup[permission_name] === false &&
                                                  <div className="user-permission__permission_value--off">Off</div>
                                                 }
                                             </div>
                                           }
                                      </div>
                                  </td>
                              </tr>
                          )
                        }

                    </tbody>
                </table>
                
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
        logged_in_users_permissions: logged_in_users_permissions(state, project_id),
        initialValues: pup,
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

export default connect(mapStateToProps)(reduxForm({form:'project_permission_form'})(UserPermission))

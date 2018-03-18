import React, { Component } from 'react'
import { connect } from 'react-redux'
import keys from 'lodash/keys'
import map from 'lodash/map'
import includes from 'lodash/includes'
import filter from 'lodash/filter'
import classNames from 'classnames'
import { reduxForm, Field } from 'redux-form';
import { getUser, ensureUsersLoaded, logged_in_users_permissions } from '../../actions/Users'
import { getProject, ensureProjectsLoaded } from '../../actions/Projects'
import {
    getProjectUserPermission,
    ensureProjectUserPermissionsLoaded,
    getLoadingProjectUserPermissionIds,
    getInvalidatedProjectUserPermissionIds
} from '../../actions/ProjectUserPermissions'
import '../../sass/user-permission.css'

class UserPermissionForm extends Component {

    constructor(props) {
        super(props)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
        this.renderPermissionCheckbox = this.renderPermissionCheckbox.bind(this)
    }
    
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

    onChangeAndSubmit(e, fieldOnChange) {
        const { handleSubmit } = this.props
        fieldOnChange(e)
        setTimeout(() => handleSubmit(), 0)
    }

    renderPermissionCheckbox(field) {
        const { input, data, onChange, label, ...rest } = field
        return <input type="checkbox"
                      label={label}
                      key={label}
                      checked={input.value}
                      onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
               />
    }

    render() {
        const { pup_id, pup, is_loading, permission_names, handleSubmit, can_edit } = this.props
        const that = this;

        return (
            <div className="user-permission">
              { !pup_id && <div>loading</div> }

              <form onSubmit={handleSubmit}>
                <table>
                  {map(permission_names, function(permission_name, index) {
                      return (
                          <tr key={index}>
                            <td>
                              <div>
                                <div className="user-permission__permission_name" key={index}>{permission_name.replace(/_/g, " ")}</div>
                              </div>
                            </td>
                            <td>
                              <div>
                                { can_edit &&
                                  <Field name={permission_name}
                                         component={that.renderPermissionCheckbox} />
                                }
                                { ! can_edit &&
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
                      )}
                   )}
                </table>
              </form>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id, user_id, onClose, onSave, permission_names } = props
    const user = getUser(state, user_id) || {}
    const project = getProject(state, project_id) || {}
    const pup = getProjectUserPermission(state, project_id, user_id) || {}

    const loading_pup_ids = getLoadingProjectUserPermissionIds(state) || []
    const invalidated_pup_ids = getInvalidatedProjectUserPermissionIds(state) || []
    
    const is_loading = ! user.id || ! project.id || ! pup.id || includes(loading_pup_ids, pup.id)
    const is_invalidated = includes(invalidated_pup_ids, pup.id)
 
    const initialValues = {}
    map(permission_names, (permission_name) => { initialValues[permission_name] = pup[permission_name] })
    const can_edit = logged_in_users_permissions(state, project_id).has_edit_permissions
    
    return {
        can_edit,
        initialValues,
        onSubmit: onSave,
        enableReinitialize: true,
        project,
        project_id,
        user,
        user_id,
        pup,
        pup_id: pup.id,
        permission_names,
        is_loading,
        is_invalidated
    }
}

export default connect(mapStateToProps)(reduxForm({form:'project_permission_form'})(UserPermissionForm))

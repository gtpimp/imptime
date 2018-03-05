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
        const { input } = field
        const { permission_name } = this.props
        return <input type="checkbox"
                      label={permission_name}
                      key={permission_name}
                      checked={input.value}
                      onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
               />
    }

    render() {
        const { pup_id, is_loading, permission_name, handleSubmit } = this.props

        return null
        
        return (
            <div className="user-permission">
                { !pup_id && <div>loading</div> }
                { pup_id &&
                  <form onSubmit={handleSubmit}>
                      <Field name={permission_name}
                             component={this.renderPermissionCheckbox} />
                  </form>
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id, user_id, onClose, onChange, permission_name } = props
    const user = getUser(state, user_id) || {}
    const project = getProject(state, project_id) || {}
    const pup = getProjectUserPermission(state, project_id, user_id) || {}

    const loading_pup_ids = getLoadingProjectUserPermissionIds(state) || []
    const invalidated_pup_ids = getInvalidatedProjectUserPermissionIds(state) || []
    
    const is_loading = ! user.id || ! project.id || ! pup.id || includes(loading_pup_ids, pup.id)
    const is_invalidated = includes(invalidated_pup_ids, pup.id)

    const initialValues = {}
    initialValues[permission_name] = pup[permission_name]
    
    return {
        logged_in_users_permissions: logged_in_users_permissions(state, project_id),
        initialValues: initialValues,
        onSubmit: onChange,
        form: 'project_permission_form__' + permission_name,
        enableReinitialize: true,
        project: project,
        project_id: project_id,
	user: user,
	user_id: user_id,
        pup: pup,
        pup_id: pup.id,
        permission_name: permission_name,
        is_loading: is_loading,
        is_invalidated: is_invalidated
    }
}

export default connect(mapStateToProps)(reduxForm()(UserPermissionForm))

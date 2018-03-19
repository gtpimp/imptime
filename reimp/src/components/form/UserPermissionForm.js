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
import {change} from 'redux-form'
import {
    getProjectUserPermission,
    ensureProjectUserPermissionsLoaded,
    getLoadingProjectUserPermissionIds,
    getInvalidatedProjectUserPermissionIds
} from '../../actions/ProjectUserPermissions'
import '../../sass/user-permission.css'

const QUICK_ROLES = { 'owner': [ 'has_delete_project',
                                 'has_invite_users',
                                 'has_set_user_permissions',
                                 'has_edit_permissions' ],
                      
                      'regular': [ 'has_view_project_card',
                                   'has_edit_issues',
                                   'has_view_issues',
                                   'has_add_issue',
                                   'has_edit_description',
                                   'has_add_issue_comment',
                                   'has_edit_subject',
                                   'has_edit_feature',
                                   'has_edit_tags',
                                   'has_edit_issue_states',
                                   'has_assign_user',
                                   'has_be_scheduled',
                                   'has_view_business_comments',
                                   'has_view_testables' ],
                      
                      'developer': [ 'has_estimate_own_points',
                                     'has_view_actual_hours',
                                     'has_import_actual_hours',],
                      
                      'manager': [ 'has_see_other_user_points',
                                   'has_view_calendar',
                                   'has_edit_business_comments',
                                   'has_delete_issue',
                                   'has_create_sprint',
                                   'has_do_dev_checklist',
                                   'has_edit_project_states',
                                   'has_do_traffic_checklist',
                                   'has_do_finance_checklist',
                                   'has_edit_sprint_status',
                                   'has_edit_sprint_type',
                                   'has_view_permissions',
                                   'has_view_review_cycle',
                                   'has_toggle_graphs',
                                   'has_edit_project_detail',
                                   'has_view_documents',
                                   'has_edit_calendar',
                                   'has_edit_review_cycle' ],
                      
                      'finance': [ 'has_edit_budget',
                                   'has_view_budget',
                                   'has_edit_invoices',
                                   'has_view_invoices',
                                   'has_edit_ctc_billable_rates',
                                   'has_view_ctc_billable_rates',
                                   'has_view_ctc_rates' ]
}

class UserPermissionForm extends Component {

    constructor(props) {
        super(props)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
        this.renderPermissionCheckbox = this.renderPermissionCheckbox.bind(this)
        this.onQuickRoleSelect = this.onQuickRoleSelect.bind(this)
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

    onQuickRoleSelect(event, role_name) {
        const { dispatch } = this.props
        const that = this
        event.stopPropagation()
        const permission_names = QUICK_ROLES[role_name]
        map(permission_names, function(permission_name) {
            dispatch(change('project_permission_form',
                            permission_name,
                            true))
        })
    }

    onClearPermissions(event) {
        const { dispatch } = this.props
        event.stopPropagation()
        const that = this
        map(keys(QUICK_ROLES, (role_name) => map(QUICK_ROLES[role_name],
                                                 (permission_name) => dispatch(change('project_permission_form', 
                                                                                      permission_name,
                                                                                      false)))))
    }

    renderQuickRoleNames() {
        const that = this
        return (
            <div className="user-permission__quick_role_buttons">
              <button className="button user-permission__quick_role_button" onClick={(event) => that.onClearPermissions(event)}>
                clear
              </button>
              {map(keys(QUICK_ROLES), function(role_name) {
                   return (
                       <button key={role_name} className="button user-permission__quick_role_button" onClick={(event) => that.onQuickRoleSelect(event, role_name)}>
                         {role_name}
                       </button>
                   )
               })
              }
            </div>
        )
    }

    renderPermissionCheckbox(field) {
        const { input, data, onChange, label, ...rest } = field
        return <input type="checkbox"
                      label={label}
                      key={label}
                      ref={(ref)=> this["permission_name_"+label]=ref}
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

              { false && this.renderQuickRoleNames() }
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

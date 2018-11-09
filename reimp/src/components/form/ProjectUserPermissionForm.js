import React, { Component } from 'react'
import { connect } from 'react-redux'
import keys from 'lodash/keys'
import map from 'lodash/map'
import includes from 'lodash/includes'
import classNames from 'classnames'
import { reduxForm, Field } from 'redux-form';
import { getUser, ensureUsersLoaded, logged_in_users_permissions } from '../../actions/Users'
import { getProject, ensureProjectsLoaded } from '../../actions/Projects'
import {change} from 'redux-form'
import {
    getProjectUserPermission,
    ensureProjectUserPermissionsLoaded,
    getLoadingProjectUserPermissionIds,
    getInvalidatedProjectUserPermissionIds,
    convert_permission_name_to_label
} from '../../actions/ProjectUserPermissions'
import '../../sass/user-permission.css'

const QUICK_ROLES = { 'owner': [ 'has_delete_project',
                                 'has_invite_users',
                                 'has_set_user_permissions',
                                 'has_edit_permissions' ],
                      
                      'regular': [ 'has_view_project_card',
                                   'has_edit_issues',
                                   'has_view_issues',
                                   'has_view_issue_history',
                                   'has_add_issue',
                                   'has_edit_description',
                                   'has_add_issue_comment',
                                   'has_edit_subject',
                                   'has_edit_feature',
                                   'has_edit_issue_feature',
                                   'has_edit_tags',
                                   'has_view_deadlines',
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
                                   'has_share_issues',
                                   'has_edit_sprint',
                                   'has_do_dev_checklist',
                                   'has_edit_project_states',
                                   'has_do_traffic_checklist',
                                   'has_do_finance_checklist',
                                   'has_edit_deadlines',
                                   'has_edit_sprint_status',
                                   'has_edit_sprint_type',
                                   'has_view_permissions',
                                   'has_view_review_cycle',
                                   'has_toggle_graphs',
                                   'has_edit_project_detail',
                                   'has_view_documents',
                                   'has_edit_calendar',
                                   'has_view_velocity',
                                   'has_edit_velocity',
                                   'has_edit_review_cycle' ],
                      
                      'finance': [ 'has_edit_budget',
                                   'has_view_budget',
                                   'has_edit_invoices',
                                   'has_view_invoices',
                                   'has_view_quotes',
                                   'has_edit_quotes',
                                   'has_edit_ctc_billable_rates',
                                   'has_view_ctc_billable_rates',
                                   'has_view_ctc_rates' ]
}

class ProjectUserPermissionForm extends Component {

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

    onChangeAndSubmit(e, fieldOnChange, permission_name) {
        const { user_id, handleSubmit, onRemoveUser } = this.props

        const is_removing_user = permission_name === "is_active_member_of_business"
        if ( is_removing_user ) {
            if (! window.confirm("Are you sure you want to remove this user from the project?" ) ) {
                return
            }
        }
        
        fieldOnChange(e)
        setTimeout(
            function() {
                handleSubmit()
                if ( is_removing_user ) {
                    onRemoveUser(user_id)
                }
            },
            0)
        
    }

    onQuickRoleSelect(event, role_name) {
        const { dispatch, handleSubmit } = this.props
        event.stopPropagation()
        const permission_names = QUICK_ROLES[role_name]
        map(permission_names, function(permission_name) {
            dispatch(change('project_permission_form',
                            permission_name,
                            true))
        })
        setTimeout(function() {handleSubmit()}, 0)
    }

    onClearPermissions(event) {
        const { dispatch, handleSubmit } = this.props
        event.stopPropagation()
        const permissions_to_clear = []
        map(keys(QUICK_ROLES), function(role_name) {
            map(QUICK_ROLES[role_name],
                function(permission_name) {
                    dispatch(change('project_permission_form', 
                                    permission_name,
                                    false))
                    permissions_to_clear.push(permission_name)
                })
        })
        setTimeout(function() {handleSubmit()}, 0)
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
        const { input, label } = field
        return <input type="checkbox"
                      label={label}
                      key={label}
                      checked={input.value}
                      onChange={(e) => this.onChangeAndSubmit(e, input.onChange, input.name)}
               />
    }

    render() {
        const { pup_id, pup, permission_names, handleSubmit, can_edit, initialValues } = this.props
        const that = this;

        return (
            <div className="user-permission">
              { this.renderQuickRoleNames() }
              <form onSubmit={handleSubmit}>

                <div className="user-permission__permission_list">
                  {map(permission_names, function(permission_name, index) {
                       return (
                           <div key={index}
                                className="user-permission__permission_card">
                             <div className={classNames({"user-permission__checkbox__on":initialValues[permission_name]===true,
                                                         "user-permission__checkbox__off":initialValues[permission_name]!==true})}
                                  key={index}>
                               {convert_permission_name_to_label(permission_name)}
                             </div>
                             <div className="user-permission__permission_value">
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
                           </div>
                       )}
                   )}
                </div>
              </form>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id, user_id, onSave, onRemoveUser, permission_names } = props
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
        onRemoveUser,
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

export default connect(mapStateToProps)(reduxForm({form:'project_permission_form'})(ProjectUserPermissionForm))

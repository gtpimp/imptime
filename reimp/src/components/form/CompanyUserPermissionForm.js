import React, { Component } from 'react'
import { connect } from 'react-redux'
import keys from 'lodash/keys'
import map from 'lodash/map'
import includes from 'lodash/includes'
import classNames from 'classnames'
import { reduxForm, Field } from 'redux-form';
import { getUser, ensureUsersLoaded, logged_in_users_company_permissions } from '../../actions/Users'
import { getCompany, ensureCompaniesLoaded } from '../../actions/Companies'
import {change} from 'redux-form'
import {
    getCompanyUserPermission,
    ensureCompanyUserPermissionsLoaded,
    getLoadingCompanyUserPermissionIds,
    getInvalidatedCompanyUserPermissionIds,
    convert_permission_name_to_label
} from '../../actions/CompanyUserPermissions'
import '../../sass/user-permission.css'

const QUICK_ROLES = { 'owner': [ 'has_edit_company_info',
                                 'has_invite_users',
                                 'has_set_user_permissions' ],
                      
                      'regular': []
}

class CompanyUserPermissionForm extends Component {

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
        this.refresh(new_props.company_id, new_props.user_id)
    }

    refresh(company_id, user_id) {
        const {dispatch} = this.props
        company_id = company_id || this.props.company_id
        user_id = user_id || this.props.user_id
        dispatch(ensureCompaniesLoaded([company_id]))
        dispatch(ensureUsersLoaded([user_id]))
        dispatch(ensureCompanyUserPermissionsLoaded(company_id))
    }

    onChangeAndSubmit(e, fieldOnChange, permission_name) {
        const { user_id, handleSubmit, onRemoveUser } = this.props

        const is_removing_user = permission_name === "is_active_member_of_company"
        if ( is_removing_user ) {
            if (! window.confirm("Are you sure you want to remove this user from the company?" ) ) {
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
            dispatch(change('company_permission_form',
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
                    dispatch(change('company_permission_form', 
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
              { !pup_id && <div>loading</div> }

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
    const { company_id, user_id, onSave, onRemoveUser, permission_names } = props
    const user = getUser(state, user_id) || {}
    const company = getCompany(state, company_id) || {}
    const pup = getCompanyUserPermission(state, company_id, user_id) || {}

    const loading_pup_ids = getLoadingCompanyUserPermissionIds(state) || []
    const invalidated_pup_ids = getInvalidatedCompanyUserPermissionIds(state) || []
    
    const is_loading = ! user.id || ! company.id || ! pup.id || includes(loading_pup_ids, pup.id)
    const is_invalidated = includes(invalidated_pup_ids, pup.id)
 
    const initialValues = {}
    map(permission_names, (permission_name) => { initialValues[permission_name] = pup[permission_name] })
    const can_edit = logged_in_users_company_permissions(state, company_id).has_set_user_permissions
    
    return {
        can_edit,
        initialValues,
        onSubmit: onSave,
        onRemoveUser,
        enableReinitialize: true,
        company,
        company_id,
        user,
        user_id,
        pup,
        pup_id: pup.id,
        permission_names,
        is_loading,
        is_invalidated
    }
}

export default connect(mapStateToProps)(reduxForm({form:'company_permission_form'})(CompanyUserPermissionForm))

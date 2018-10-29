import React, { Component } from 'react'
import { connect } from 'react-redux'
import {withRouter} from 'react-router-dom'
import keys from 'lodash/keys'
import map from 'lodash/map'
import filter from 'lodash/filter'
import CompanyUserPermissionForm from './form/CompanyUserPermissionForm'
import { getUser, ensureUsersLoaded, logged_in_users_company_permissions } from '../actions/Users'
import { getCompany, ensureCompaniesLoaded } from '../actions/Companies'
import { getCompanyUserPermission, ensureCompanyUserPermissionsLoaded } from '../actions/CompanyUserPermissions'
import '../sass/user-permission.css'
import {
    updateCompanyUserPermissions
} from '../actions/CompanyUserPermissions'

class CompanyUserPermissions extends Component {

    constructor(props) {
        super(props)
        this.onChangePermission = this.onChangePermission.bind(this)
        this.onRemoveUser = this.onRemoveUser.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.user_id !== this.props.user_id || new_props.company_id !== this.props.company_id ||
             new_props.user.id !== this.props.user.id || new_props.company.id !== this.props.company.id ) {
            this.refresh(new_props.company_id, new_props.user_id, new_props.user, new_props.company)
        }
    }

    refresh(company_id, user_id, user, company) {
        const {dispatch} = this.props
        user = user || {}
        company = company || {}
        company_id = company_id || this.props.company_id
        user_id = user_id || this.props.user_id
        dispatch(ensureCompaniesLoaded([company_id]))
        dispatch(ensureUsersLoaded([user_id]))
        dispatch(ensureCompanyUserPermissionsLoaded(company_id, user_id))
    }

    onChangePermission(new_values) {
        const { user_id, company_id, dispatch } = this.props

        const permission_values = {}
        map(keys(new_values), (permission_name) => permission_values[permission_name] = new_values[permission_name] === true)

        dispatch(updateCompanyUserPermissions(company_id, user_id, permission_values))
    }

    onRemoveUser() {
        const { company_id, history } = this.props
        history.push('/companies/'+company_id+'/users/')
    }

    render() {
        const { user, company, is_loading,
                permission_names, logged_in_users_permissions } = this.props

        return (
            <div className="user-permission">

                <h2>Permissions for {user.username} in company {company.name}</h2>

	                { is_loading &&
                          <div>Loading...</div>
                        }

                        { !is_loading && ! logged_in_users_permissions.has_set_user_permissions &&
                          <div>You are not allowed to view permissions</div>
                        }

                        { !is_loading && logged_in_users_permissions.has_set_user_permissions &&

                          <CompanyUserPermissionForm permission_names={permission_names}
                                                     user_id={user.id}
                                                     company_id={company.id}
                                                     onRemoveUser={this.onRemoveUser}
                                                     onSave={this.onChangePermission} />
                        }

            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { company_id, user_id, onChange } = props
    const user = getUser(state, user_id) || {}
    const company = getCompany(state, company_id) || {}
    const pup = getCompanyUserPermission(state, company_id, user_id) || {}

    const permission_names = filter(keys(pup), function(o) { return o.startsWith("has_") || o.startsWith('is_') })
    const is_loading = ( ! user.id || ! company.id || ! pup.id )
    
    return {
        logged_in_users_permissions: logged_in_users_company_permissions(state, company_id),
        onChange: onChange,
        company: company,
        company_id: company_id,
	user: user,
	user_id: user_id,
        pup: pup,
        pup_id: pup.id,
        is_loading: is_loading,
        permission_names: permission_names
    }
}

export default withRouter(connect(mapStateToProps)(CompanyUserPermissions))

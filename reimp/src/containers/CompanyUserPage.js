import React, {Component} from 'react'
import {connect} from 'react-redux'
import { compact } from 'lodash'
import {withRouter} from 'react-router-dom'
import { setCompanyUserBreadcrumbsHelper } from '../actions/Breadcrumbs'
import {ensureCompaniesLoaded, getCompany} from '../actions/Companies'
import {ensureUsersLoaded, getUser} from '../actions/Users'
import CompanyUsers from '../components/CompanyUsers'
import CompanyUserPermissions from '../components/CompanyUserPermissions'
import {
    PAGE_KEY__COMPANY_USER_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    setPageSelectedEntities
} from '../actions/Page'

class CompanyUserPage extends Component {

    componentDidMount() {
        // dispatch(set_toolbars(PAGE_KEY__COMPANY_USER_PAGE, ['company-user']))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { company_id, user_id } = this.props
        if ( new_props.company_id !== company_id || new_props.company.id !== this.props.company.id ||
             new_props.user_id !== user_id || new_props.user.id !== this.props.user.id) {
            this.refresh(new_props)
        } else {
            this.ensureCompanyLoaded(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, company_id, user_id, company, user } = props
        if ( company_id ) {
            dispatch(ensureCompaniesLoaded([company_id]))
            if ( user_id ) {
                dispatch(ensureUsersLoaded([user_id]))
            }
            dispatch(setPageSelectedEntities(PAGE_KEY__COMPANY_USER_PAGE,
                                             {company_ids:[company_id],
                                              user_ids:compact([user_id])}))
        }
        if ( company && company.id ) {
            dispatch(setCompanyUserBreadcrumbsHelper(company, user))
        }
    }

    ensureCompanyLoaded = (these_props) => {
        const props = these_props || this.props
        const { dispatch, company_id } = props
        if ( company_id ) {
            dispatch(ensureCompaniesLoaded([company_id]))
        }
    }

    navigateToCompanyUserPermissions = (user, event) => {
        const { company_id, history } = this.props
        event.stopPropagation()
        event.preventDefault()
        history.push('/companies/'+company_id+'/users/'+user.id + '/permissions')
    }

    closeCompanyUserPermissions = () => {
        const { company_id, history } = this.props
        history.push('/companies/'+company_id+'/users/')
    }

    renderUserPermissions() {
        const { company_id, user_id } = this.props
        const that = this
        return (
            <div className="company-user__user_permissions">
              <CompanyUserPermissions company_id={company_id}
                                      user_id={user_id}
                                      onClose={that.closeCompanyUserPermissions} />
            </div>
        )
    }
    
    render() {
        const { company, view_mode } = this.props
        const that = this
        return (
            <div>
              { view_mode === 'permissions' && this.renderUserPermissions() }

              { view_mode === 'list' &&
                <div>
                  <div className="company-user__company_users">
                    <CompanyUsers
                        company_id={company.id}
                        onPermissionsAction={that.navigateToCompanyUserPermissions}
                    />
                  </div>
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const company_id = props.match.params.companyId
    const user_id = props.match.params.userId
    const view_mode = props.match.params.viewMode || 'list'
    const company = getCompany(state, company_id)
    const user = getUser(state, user_id)
    
    return {
        company_id,
        company: company || {},
        user_id,
        view_mode,
        user: user || {},
        username: (user || {}).username
    }
}

export default withRouter(connect(mapStateToProps)(CompanyUserPage))

import React, {Component} from 'react'
import {connect} from 'react-redux'
import { union } from 'lodash'
import {withRouter} from 'react-router-dom'
import {getCompany, is_company_invalidated} from '../actions/Companies'
import InviteCompanyUserForm from '../components/form/InviteCompanyUserForm'
import ModalDialog from '../components/ModalDialog'
import UserList from './UserList'
import {ensureUsersLoaded, has_company_permission} from '../actions/Users'
import {
    PAGE_KEY__COMPANY_USER_PAGE,
    LIST_KEY__COMPANY_USER_LIST
} from '../actions/ItemListKeyRegistry'
import {
    update_list_filter,
    selectItems
} from '../actions/ItemList'
import {
    select_users,
    setPageFlag,
    clearPageFlag,
    getPageFlag
} from '../actions/Page'
import {saveInviteUser} from '../actions/Companies'
import '../sass/inviting.css'

class CompanyUsersPage extends Component {

    constructor(props) {
        super(props)
        this.onStartInviteUser = this.onStartInviteUser.bind(this)
        this.onCancelInviteUser = this.onCancelInviteUser.bind(this)
        this.onSaveInviteUser = this.onSaveInviteUser.bind(this)
        this.onSelectUsers = this.onSelectUsers.bind(this)
        this.getActionRenderFunc = this.getActionRenderFunc.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const {company_id} = this.props
        if (new_props.company_id !== company_id || new_props.company.id !== this.props.company.id) {
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, company, company_id} = props
        dispatch(update_list_filter(LIST_KEY__COMPANY_USER_LIST, {'company_id': company_id}))
        if ( company.id ) {
            dispatch(ensureUsersLoaded(union(company.invited_user_ids, company.allowed_user_ids)))
        }
    }

    onSelectUsers(user_ids) {
        const {dispatch, history, company_id} = this.props
        dispatch(selectItems(LIST_KEY__COMPANY_USER_LIST, user_ids))
        dispatch(select_users(PAGE_KEY__COMPANY_USER_PAGE, user_ids))
        if (user_ids && user_ids.length === 1) {
            history.push('/companies/' + company_id + '/users/' + user_ids[0]);
        }
    }

    onStartInviteUser() {
        const {dispatch} = this.props
        dispatch(setPageFlag(PAGE_KEY__COMPANY_USER_PAGE, 'inviting_user'))
    }

    onCancelInviteUser() {
        const {dispatch} = this.props
        dispatch(clearPageFlag(PAGE_KEY__COMPANY_USER_PAGE, 'inviting_user'))
    }

    onSaveInviteUser(new_value) {
        const {dispatch, company_id} = this.props
        dispatch(saveInviteUser(company_id, new_value.invited_user_email))
        dispatch(clearPageFlag(PAGE_KEY__COMPANY_USER_PAGE, 'inviting_user'))
    }

    renderInviteUser() {
        const { company_id } = this.props
        const that = this
        return (
            <ModalDialog isOpen={true}
                         onClose={that.onCancelInviteUser}
                         title="Invite People to Company"
                         variant="large">

                <div>
                    <InviteCompanyUserForm company_id={company_id} onChange={that.onSaveInviteUser}/>
                </div>
            </ModalDialog>
        )
    }

    getActionRenderFunc() {
        const {onPermissionsAction, can_view_permissions} = this.props
        const funcs = {}
        if ( can_view_permissions ) {
            funcs.render_permissions = (user) =>
                <button className="button"
                        key={"permissions_"+user.id}
                        onClick={(event) => onPermissionsAction(user, event)}>
                  Permissions
                </button>
        }
        return funcs
    }

    render() {

        const {is_inviting_user, invited_user_ids, allowed_user_ids, can_invite_user} = this.props

        return (
            <div>
              { is_inviting_user && this.renderInviteUser() }

              <h2>Members</h2>
              { can_invite_user && 
                <div className="button button-primary button__default-width" onClick={this.onStartInviteUser}>
                  <i className="material-icons md-18">add_circle_outline</i>
                  Add user
                </div>
              }
              <UserList invited_user_ids={invited_user_ids}
                        user_ids={allowed_user_ids}
                        onSelectUsers={this.onSelectUsers}
                        user_actions={this.getActionRenderFunc()}
              />

            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {company_id, onPermissionsAction} = props
    const company = getCompany(state, company_id)
    const is_inviting_user = getPageFlag(state, PAGE_KEY__COMPANY_USER_PAGE, 'inviting_user')
    const can_view_permissions = has_company_permission(state, company_id, 'has_set_user_permissions')
    const can_invite_user = has_company_permission(state, company_id, 'has_invite_users')
    const is_invalidated = is_company_invalidated(state, company_id)
    return {
        company_id,
        company: company || {},
        can_view_permissions,
        can_invite_user,
        is_inviting_user,
        onPermissionsAction,
        invited_user_ids: (company || {}).invited_user_ids || [],
        is_invalidated,
        is_loading: !company || !company.id,
        allowed_user_ids: (company || {}).allowed_user_ids || []
    }
}

export default withRouter(connect(mapStateToProps)(CompanyUsersPage))

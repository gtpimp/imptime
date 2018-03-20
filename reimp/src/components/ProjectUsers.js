import React, {Component} from 'react'
import {connect} from 'react-redux'
import { union } from 'lodash'
import {browserHistory} from 'react-router'
import {getProject} from '../actions/Projects'
import InviteUserForm from '../components/form/InviteUserForm'
import ModalDialog from '../components/ModalDialog'
import UserList from './UserList'
import {ensureUsersLoaded, getUser, has_permission} from '../actions/Users'
import {
    PAGE_KEY__PROJECT_DASHBOARD_PAGE,
    LIST_KEY__PROJECT_USER_LIST
} from '../actions/ItemListKeyRegistry'
import {
    update_list_filter,
    selectItems
} from '../actions/ItemList'
import {
    set_toolbars,
    select_users,
    setPageFlag,
    clearPageFlag,
    getPageFlag
} from '../actions/Page'
import {saveInviteUser} from '../actions/Projects'
import '../sass/inviting.css'

class ProjectUsersPage extends Component {

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
        const {project_id} = this.props
        if (new_props.project_id !== project_id || new_props.project.id !== this.props.project.id) {
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, project, project_id} = props
        dispatch(update_list_filter(LIST_KEY__PROJECT_USER_LIST, {'project_id': project_id}))
        if ( project.id ) {
            dispatch(ensureUsersLoaded(union(project.invited_user_ids, project.allowed_user_ids)))
        }
    }

    onSelectUsers(user_ids) {
        const {dispatch, project_id} = this.props
        dispatch(selectItems(LIST_KEY__PROJECT_USER_LIST, user_ids))
        dispatch(select_users(PAGE_KEY__PROJECT_DASHBOARD_PAGE, user_ids))
        if (user_ids && user_ids.length === 1) {
            browserHistory.push('/projects/' + project_id + '/users/' + user_ids[0]);
        }
    }

    onStartInviteUser() {
        const {dispatch} = this.props
        dispatch(setPageFlag(PAGE_KEY__PROJECT_DASHBOARD_PAGE, 'inviting_user'))
    }

    onCancelInviteUser() {
        const {dispatch} = this.props
        dispatch(clearPageFlag(PAGE_KEY__PROJECT_DASHBOARD_PAGE, 'inviting_user'))
    }

    onSaveInviteUser(new_value) {
        const {dispatch, project_id} = this.props
        dispatch(saveInviteUser(project_id, new_value.invited_user_email))
        dispatch(clearPageFlag(PAGE_KEY__PROJECT_DASHBOARD_PAGE, 'inviting_user'))
    }

    renderInviteUser() {
        const { project_id } = this.props
        const that = this
        return (
            <ModalDialog isOpen={true}
                         onClose={that.onCancelInviteUser}
                         title="Invite People to Project"
                         variant="large">

                <div>
                    <InviteUserForm project_id={project_id} onChange={that.onSaveInviteUser}/>
                </div>
            </ModalDialog>
        )
    }

    getActionRenderFunc() {
        const {onPermissionsAction, can_view_permissions} = this.props
        const that = this
        const funcs = {}
        if ( can_view_permissions ) {
            funcs.render_permissions = (user) =>
                <button className="button"
                        key={user.id}
                        onClick={(event) => onPermissionsAction(user, event)}>
                  Permissions
                </button>
        }
        return funcs
    }

    render() {

        const {is_inviting_user, invited_user_ids, project} = this.props

        return (
            <div>
                { is_inviting_user && this.renderInviteUser() }

                <h2>Team</h2>
                <div className="button button-primary button__default-width" onClick={this.onStartInviteUser}>
                  <i className="material-icons md-18">add_circle_outline</i>
                  Add user
                </div>
                <UserList list_key={LIST_KEY__PROJECT_USER_LIST}
                          invited_user_ids={invited_user_ids}
                          user_ids={project.allowed_user_ids}
                          onSelectUsers={this.onSelectUsers}
                          user_actions={this.getActionRenderFunc()}
                />

            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {project_id} = props
    const project = getProject(state, project_id)
    const is_inviting_user = getPageFlag(state, PAGE_KEY__PROJECT_DASHBOARD_PAGE, 'inviting_user')
    const can_view_permissions = has_permission(state, project_id, 'has_view_permissions')
    return {
        project_id,
        project: project || {},
        can_view_permissions,
        is_inviting_user,
        invited_user_ids: (project || {}).invited_user_ids || []
    }
}

export default connect(mapStateToProps)(ProjectUsersPage)

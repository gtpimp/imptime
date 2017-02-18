import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import InviteUserForm from '../components/form/InviteUserForm'
import Modal from 'react-modal'
import UserList from './UserList'
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
import { saveInviteUser } from '../actions/Projects'

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
        const {dispatch, project_id} = this.props
        this.refresh(project_id)
    }

    componentWillReceiveProps(new_props) {
        const { project_id, dispatch } = this.props
        if ( new_props.project_id !== project_id || new_props.project.id !== this.props.project.id ) {
            this.refresh(new_props.project_id)
        }
    }
    
    refresh(project_id) {
        const { dispatch, project } = this.props
        dispatch(update_list_filter(LIST_KEY__PROJECT_USER_LIST, {'project_id':project_id}))
    }

    onSelectUsers(user_ids) {
        const { dispatch, project_id } = this.props
        dispatch(selectItems(LIST_KEY__PROJECT_USER_LIST, user_ids))
        dispatch(select_users(PAGE_KEY__PROJECT_DASHBOARD_PAGE, user_ids))
        if ( user_ids && user_ids.length === 1 ) {
            browserHistory.push('/projects/'+project_id+'/users/'+user_ids[0]);
        }
    }
    
    onStartInviteUser() {
        const { dispatch } = this.props
        dispatch(setPageFlag(PAGE_KEY__PROJECT_DASHBOARD_PAGE, 'inviting_user'))
    }

    onCancelInviteUser() {
        const { dispatch } = this.props
        dispatch(clearPageFlag(PAGE_KEY__PROJECT_DASHBOARD_PAGE, 'inviting_user'))
    }

    onSaveInviteUser(new_value) {
        const { dispatch, project_id } = this.props
        dispatch(saveInviteUser(project_id, new_value.invited_user_email))
        dispatch(clearPageFlag(PAGE_KEY__PROJECT_DASHBOARD_PAGE, 'inviting_user'))
    }

    renderInviteUser() {
        const that = this
        return (
            <Modal isOpen={true}
                   className="editable-property-modal"
                   overlayClassName="editable-property-modal__overlay"
                   onRequestClose={that.onCancelInviteUser}
                   contentLabel="Invite to this project">

                <div>
                    <InviteUserForm onChange={that.onSaveInviteUser}/>
                    <button onClick={that.onCancelInviteUser}>Cancel</button>
                </div>
            </Modal>
        )
    }

    getActionRenderFunc() {
        const { onPermissionsAction } = this.props
        const that = this
        return {
            render_permissions: (user) => <div key={user.id} onClick={onPermissionsAction}>Permissions</div>
        }
    }
    
    render() {

        const { is_inviting_user, invited_user_ids } = this.props
        
        return (
            <div>
                { is_inviting_user && this.renderInviteUser() }

                { ! is_inviting_user &&
                  <div>
                      
                      <button onClick={this.onStartInviteUser}>Invite somebody to this project</button>
                      <br/>
                  </div>
                }

                <h2>Users</h2>
                <UserList list_key={LIST_KEY__PROJECT_USER_LIST}
                          invited_user_ids={invited_user_ids}
                          onSelectUsers={this.onSelectUsers}
                          user_actions={this.getActionRenderFunc()}
                />
                
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id } = props
    const project = getProject(state, project_id)
    const is_inviting_user = getPageFlag(state, PAGE_KEY__PROJECT_DASHBOARD_PAGE, 'inviting_user')
    return {
        project_id: project_id,
        project: project || {},
        is_inviting_user: is_inviting_user,
        invited_user_ids: (project || {}).invited_user_ids || []
    }
}

export default connect(mapStateToProps)(ProjectUsersPage)

import React, {Component} from 'react'
import {connect} from 'react-redux'

import RIEInput from '../widgets/RIEInput'
import RIEModeToggler from '../widgets/RIEModeToggler'
import each from 'lodash/each'
import map from 'lodash/map'
import union from 'lodash/union'
import includes from 'lodash/includes'
import difference from 'lodash/difference'
import {
    initList,
    invalidateList
} from '../actions/ItemList'
import {
    invalidateAllUsers,
    ensureUsersLoaded,
    startInviteUser,
    updateInviteTitle,
    cancelInviteUser,
    saveInviteUser
} from '../actions/Users'
import User from './User'
import ListTable from './ListTable'

class UserList extends Component {

    componentDidMount() {
        const {dispatch, project_id, user_ids} = this.props
        dispatch(ensureUsersLoaded(user_ids))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, project_id} = new_props
        if ( new_props.user_ids !== this.props.user_ids ) {
            dispatch(ensureUsersLoaded(new_props.user_ids))
        }
    }

    onStartInviteUser(event) {
        const {dispatch, list_key} = this.props
        event.stopPropagation()
        dispatch(startInviteUser(list_key))
    }

    onSaveInviteUser(invite_user_title) {
        const {dispatch} = this.props
        dispatch(updateInviteTitle(invite_user_title))
        dispatch(saveInviteUser())
    }

    onCancelInviteUser() {
        const {dispatch} = this.props
        dispatch(cancelInviteUser())
    }

    render() {

        const {
            users, list_key,
            selected_ids,
            is_inviting_user, invite_user,
            loading_item_ids,
            invited_user_ids,
            user_actions
        } = this.props
        const that = this

        const user_rows = []
        each(users, function (user, index) {

            const invitation_pending = includes(invited_user_ids, user.id)
            
            user_rows.push(
                <User key={list_key + user.id + index}
                      user_id={user.id}
                      invitation_pending={invitation_pending}
                      user_actions={user_actions}
                />
            )
        })

        return (
            <ListTable>
                {user_rows}
            </ListTable>
        )
    }
}

function mapStateToProps(state, props) {
    const {user, item_list} = state
    const {list_key, project_id, invited_user_ids, user_ids, user_actions} = props
    const all_items_by_id = (user && user.items_by_id) || {}
    const items_by_id = map(user_ids, (user_id) => all_items_by_id[user_id])

    const items_to_display = (items_by_id && user_ids.map(function (visible_item_id, index) {
        return items_by_id[visible_item_id] || {
            'id': visible_item_id,
            'loaded': false
        }
    })) || []

    const invite_user = (user && user.invite_user) || null
    const is_inviting_user = invite_user || false

    return {
        project_id,
        users: items_to_display,
        user_ids: map(items_to_display, 'id'),
        has_items: items_to_display && items_to_display.length > 0,
        is_visible: project_id || false,
        invite_user,
        is_inviting_user,
        invited_user_ids,
        user_actions
    }
}

export default connect(mapStateToProps)(UserList)

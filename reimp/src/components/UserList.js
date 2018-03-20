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
    fetchUsersIfNeeded,
    startInviteUser,
    updateInviteTitle,
    cancelInviteUser,
    saveInviteUser
} from '../actions/Users'
import User from './User'
import ListTable from './ListTable'

class UserList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
        this.onChangePage = this.onChangePage.bind(this)
        this.onClickedUser = this.onClickedUser.bind(this)
    }

    componentDidMount() {
        const {dispatch, list_key, project_id} = this.props
        if (project_id) {
            dispatch(initList(list_key))
            dispatch(fetchUsersIfNeeded(list_key))
        }
    }

    componentWillReceiveProps() {
        const {dispatch, list_key, project_id} = this.props
        if (project_id) {
            dispatch(fetchUsersIfNeeded(list_key))
        }
    }

    onClickedUser(user_id) {
        const {onSelectUsers, selected_ids} = this.props
        event.stopPropagation()

        let selected_user_ids = []
        if (event.ctrlKey) {
            if (includes(selected_ids, user_id)) {
                selected_user_ids = difference(selected_ids, [user_id])
            } else {
                selected_user_ids = union(selected_ids, [user_id])
            }
        } else {
            selected_user_ids = [user_id]
        }
        onSelectUsers(selected_user_ids)
    }

    onChangePage() {
        const {dispatch, list_key} = this.props
        dispatch(invalidateList(list_key))
        dispatch(fetchUsersIfNeeded(list_key))
    }

    onRefresh(event) {
        const {dispatch, list_key} = this.props
        dispatch(invalidateList(list_key))
        dispatch(invalidateAllUsers())
        dispatch(fetchUsersIfNeeded(list_key))
        if (event) {
            event.stopPropagation()
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
                      // onClickedUser={() => that.onClickedUser(user.id)}
                      is_loading={loading_item_ids.indexOf(user.id) !== -1}
                      is_selected={selected_ids.indexOf(user.id) !== -1}
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
    const {user, item_list, user_ids} = state
    const {list_key, invited_user_ids, user_actions} = props
    const all_items_by_id = (user && user.items_by_id) || {}
    const items_by_id = map(user_ids, (user_id) => all_items_by_id[user_id])
    const l = (item_list && item_list[list_key]) || {}
    const filter = l.filter || {}
    const project_id = filter.project_id || null
    const visible_item_ids = l.visible_item_ids || []

    const selected_items = items_by_id && l.selected_ids && l.selected_ids.map(function (selected_id, index) {
        return items_by_id[selected_id] || {
            'id': selected_id,
            'loaded': false
        }
    })

    const items_to_display = (items_by_id && visible_item_ids.map(function (visible_item_id, index) {
        return items_by_id[visible_item_id] || {
            'id': visible_item_id,
            'loaded': false
        }
    })) || []

    const invite_user = (user && user.invite_user) || null
    const is_inviting_user = invite_user || false

    return {
        list_key: list_key,
        project_id: project_id,
        users: items_to_display,
        user_ids: map(items_to_display, 'id'),
        selected_ids: l.selected_ids || [],
        selected_items: selected_items || [],
        loading_item_ids: l.loading_item_ids || [],
        has_items: items_to_display && items_to_display.length > 0,
        is_visible: project_id || false,
        is_loading: l.is_loading,
        last_updated: l.last_updated,
        invite_user: invite_user,
        is_inviting_user: is_inviting_user,
        invited_user_ids: invited_user_ids,
        user_actions: user_actions
    }
}

export default connect(mapStateToProps)(UserList)

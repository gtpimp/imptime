import React, {Component} from 'react'
import {connect} from 'react-redux'

import each from 'lodash/each'
import map from 'lodash/map'
import includes from 'lodash/includes'
import {
    ensureUsersLoaded
} from '../actions/Users'
import User from './User'
import ListTable from './ListTable'

class UserList extends Component {

    componentDidMount() {
        const {dispatch, user_ids} = this.props
        dispatch(ensureUsersLoaded(user_ids))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch} = new_props
        if ( new_props.user_ids !== this.props.user_ids ) {
            dispatch(ensureUsersLoaded(new_props.user_ids))
        }
    }

    render() {

        const {
            users, list_key,
            invited_user_ids,
            user_actions
        } = this.props

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
    const {user} = state
    const {invited_user_ids, user_ids, user_actions} = props
    const all_items_by_id = (user && user.items_by_id) || {} 

    const items_to_display = (all_items_by_id && user_ids.map(function (visible_item_id, index) {
        return all_items_by_id[visible_item_id] || {
            'id': visible_item_id,
            'loaded': false
        }
    })) || []

    const invite_user = (user && user.invite_user) || null
    const is_inviting_user = invite_user || false

    return {
        users: items_to_display,
        user_ids: map(items_to_display, 'id'),
        has_items: items_to_display && items_to_display.length > 0,
        invite_user,
        is_inviting_user,
        invited_user_ids,
        user_actions
    }
}

export default connect(mapStateToProps)(UserList)

import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar-panel.css'
import { LIST_KEY__CLOCK_HISTORY_LIST } from '../../actions/ItemListKeyRegistry'
import ToggleButton from './ToggleButton'
import { getListFilter, update_list_filter, clear_list_filter_option, invalidateList } from '../../actions/ItemList'
import { logged_in_user } from '../../actions/Auth'

class ClockHistoryToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onToggleLoggedInUsersEntriesOnly = this.onToggleLoggedInUsersEntriesOnly.bind(this)
    }

    onToggleLoggedInUsersEntriesOnly() {
        const { dispatch, list_key, logged_in_users_entries_only, logged_in_user_id } = this.props
        if ( logged_in_users_entries_only ) {
            dispatch(clear_list_filter_option(list_key, 'user_id'))
        } else {
            dispatch(update_list_filter(list_key, {user_id: logged_in_user_id}))
        }
        dispatch(invalidateList(list_key))
    }

    render() {

        const { logged_in_users_entries_only } = this.props

        return (
            <div className="toolbar-panel">
              <ToggleButton value={logged_in_users_entries_only}
                            onChange={this.onToggleLoggedInUsersEntriesOnly}
                            on_label={"My entries"}
                            off_label={"All users"}
              />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const list_key = LIST_KEY__CLOCK_HISTORY_LIST
    const list_filter = getListFilter(state, list_key)
    const logged_in_user_id = logged_in_user(state).user_id
    const logged_in_users_entries_only = list_filter.user_id === logged_in_user_id

    return {
        logged_in_users_entries_only,
        logged_in_user_id,
        list_filter,
        list_key
    }
}


export default connect(mapStateToProps)(ClockHistoryToolbarPanel)

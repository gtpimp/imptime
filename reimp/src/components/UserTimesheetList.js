import React, { Component } from 'react'
import { map, size } from 'lodash'
import { DragSource, DropTarget } from 'react-dnd'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { DndTypes } from '../actions/Dnd'
import '../sass/user-timesheet.css'
import {
    initList,
    invalidateList,
    getVisibleItemIds,
    getVisibleItems,
    isLoading,
    getLastUpdated,
    getLoadingItemIds
} from '../actions/ItemList'
import {
    invalidateAllUserTimesheets,
    fetchUserTimesheetsIfNeeded
} from '../actions/UserTimesheets'
import { ensureUsersLoaded } from '../actions/Users'
import UserTimesheet from './UserTimesheet'
import { ENTITY_KEY__USER_TIMESHEET } from '../actions/ItemListKeyRegistry'

class UserTimesheetList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
	this.onChangePage = this.onChangePage.bind(this)
    }
    
    componentDidMount() {
        const { dispatch, list_key } = this.props
        dispatch(initList(list_key))
	dispatch(fetchUserTimesheetsIfNeeded(list_key))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, list_key } = this.props
        dispatch(fetchUserTimesheetsIfNeeded(list_key))
    }

    onChangePage() {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(fetchUserTimesheetsIfNeeded(list_key))
    }
    
    onRefresh(event) {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(invalidateAllUserTimesheets())
	dispatch(fetchUserTimesheetsIfNeeded(list_key))
	if ( event ) {
	    event.stopPropagation()
	}
    }

    render() {
        const { user_timesheets } = this.props

        return (
            <div className="user-timesheet-list">
              <div>User Timesheets</div>
              <div className="user-timesheet-list__user-timesheets">
                { map(user_timesheets, (user_timesheet) =>
                    <div key={user_timesheet.id} className="user-timesheet-list__user-timesheet">
                      <UserTimesheet key={user_timesheet.id} user_id={user_timesheet.id} />
                    </div>
                  )}
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { item_list } = state
    const { list_key } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__USER_TIMESHEET)
    const is_loading = isLoading(state, list_key)
    const last_updated = getLastUpdated(state, list_key)
    const loading_item_ids = getLoadingItemIds(state, list_key)
    
    return {
        list_key: list_key,
        user_timesheets: visible_items,
	user_ids: visible_item_ids,
        loading_item_ids: loading_item_ids,
        has_items: visible_items && visible_items.length > 0,
        is_loading: is_loading,
        last_updated: last_updated
    }
}

export default connect(mapStateToProps)(UserTimesheetList)

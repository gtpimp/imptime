import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import {
    initList,
    shouldFetchList,
    getVisibleItemIds,
    getNestedObjects,
    ensureNestedObjectsLoaded,
    isLoading,
    getLastUpdated,
    update_list_pagination,
    update_list_ordering,
    update_list_format
} from '../actions/ItemList'
import { ENTITY_KEY__SCHEDULE } from '../actions/ItemListKeyRegistry'
import {
    fetchSchedulesIfNeeded
} from '../actions/Schedules'
import { isLoadingItems, areAnyItemsInvalidated } from '../actions/Item'
import Schedule from './Schedule'

class ScheduleList extends Component {
    
    componentDidMount() {
	const { dispatch, list_key, nested_objects } = this.props
	dispatch(initList(list_key))
        dispatch(update_list_pagination(list_key, { 'page_size': 50 }))
        dispatch(update_list_format(list_key, { 'spread': true }))
        dispatch(update_list_ordering(list_key, { 'due_date': 'asc' }))
        dispatch(fetchSchedulesIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, list_key, nested_objects } = new_props
        dispatch(fetchSchedulesIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    render() {

        const { schedule_ids, is_loading } = this.props

        if ( (is_loading && !schedule_ids && schedule_ids.length) === 0 ) {
            return (
                <div>Loading...</div>
            )
        }

        return (
            <div className="schedule-list">
              { map(schedule_ids, (schedule_id) =>  <Schedule key={schedule_id} schedule_id={schedule_id} />) }
              { (!schedule_ids || schedule_ids.length) === 0 &&
                (
                    <div className="schedule-list__empty">
                      { ! is_loading && "No schedules. Go in peace." }
                      { is_loading && "Loading..." }
                    </div>
                )
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { list_key } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const is_loading = isLoading(state, list_key) || isLoadingItems(state, ENTITY_KEY__SCHEDULE, visible_item_ids)
    const last_updated = getLastUpdated(state, list_key)
    const nested_objects = getNestedObjects(state, list_key)
    const should_fetch_list = shouldFetchList(state, list_key)
    const is_invalidated = areAnyItemsInvalidated(state, ENTITY_KEY__SCHEDULE, visible_item_ids)

    return {
        schedule_ids: visible_item_ids,
        is_loading,
        is_invalidated,
        should_fetch_list,
        last_updated,
        nested_objects
    }
}

export default connect(mapStateToProps)(ScheduleList)

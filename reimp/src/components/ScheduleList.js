import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import {
    initList,
    shouldFetchList,
    getVisibleItemIds,
    getNestedObjects,
    ensureNestedObjectsLoaded,
    getLoadingItemIds,
    getSelectedItemIds,
    isLoading,
    getLastUpdated,
    update_list_pagination
} from '../actions/ItemList'
import { ENTITY_KEY__SCHEDULE } from '../actions/ItemListKeyRegistry'
import {
    fetchSchedulesIfNeeded,
    getSchedules
} from '../actions/Schedules'
import { isLoadingItems, areAnyItemsInvalidated } from '../actions/Item'
import Schedule from './Schedule'
import DivTable from './DivTable'

class ScheduleList extends Component {

    componentDidMount() {
	const { dispatch, list_key, nested_objects } = this.props
	dispatch(initList(list_key))
        dispatch(update_list_pagination(list_key, { 'page_size': 50 }))
        dispatch(fetchSchedulesIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, list_key, nested_objects } = new_props
        dispatch(fetchSchedulesIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    renderSchedule(schedule, index) {
        const { list_key, loading_item_ids, header_list, onClickedSchedule, selected_ids } = this.props
        const that = this

        const is_loading = loading_item_ids.indexOf(schedule.id) !== -1 || schedule.loaded === false

        return (
            <Schedule key={list_key + "_" + schedule.id + "_" + schedule.name + "_" + index}
                      is_collapsed={false}
                      onDelete={that.onDeleteSchedule}
                      onClickedSchedule={onClickedSchedule}
                      is_selected={selected_ids.indexOf(schedule.id) !== -1}
                      is_loading={is_loading}
                      header_list={header_list}
                      schedule_id={schedule.id}
            />
        )
    }

    render() {

        const { schedules, is_loading, header_list } = this.props

        if ( is_loading ) {
            return (
                <div>Loading...</div>
            )
        }

        return (
            <div className="schedule-list">
              <DivTable header_list={header_list}>
                { map(schedules, (schedule, index) =>  this.renderSchedule(schedule, index)) }
              </DivTable>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { list_key, header_list, onClickedSchedule } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const is_loading = isLoading(state, list_key) || isLoadingItems(state, ENTITY_KEY__SCHEDULE, visible_item_ids)
    const last_updated = getLastUpdated(state, list_key)
    const nested_objects = getNestedObjects(state, list_key)
    const should_fetch_list = shouldFetchList(state, list_key)
    const is_invalidated = areAnyItemsInvalidated(state, ENTITY_KEY__SCHEDULE, visible_item_ids)
    const schedules = getSchedules(state, visible_item_ids)
    const loading_item_ids = getLoadingItemIds(state, list_key)
    const selected_ids = getSelectedItemIds(state, list_key)

    return {
        schedule_ids: visible_item_ids,
        schedules,
        is_loading,
        is_invalidated,
        should_fetch_list,
        last_updated,
        nested_objects,
        header_list,
        loading_item_ids,
        selected_ids,
        onClickedSchedule
    }
}

export default connect(mapStateToProps)(ScheduleList)

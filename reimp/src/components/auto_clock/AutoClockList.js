import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map, values } from 'lodash'
import classNames from 'classnames'
import {
    initList,
    invalidateList,
    shouldFetchList,
    getVisibleItemIds,
    getNestedObjects,
    ensureNestedObjectsLoaded,
    isLoading,
    getLastUpdated,
    update_list_pagination,
    update_list_ordering,
    update_list_filter,
    getListFilter
} from '../../actions/ItemList'
import { ENTITY_KEY__AUTO_CLOCK } from '../../actions/ItemListKeyRegistry'
import {
    fetchAutoClocksIfNeeded, getAutoClocks
} from '../../actions/AutoClock'
import DivTable from '../DivTable'
import { isLoadingItems, areAnyItemsInvalidated } from '../../actions/Item'
import { logged_in_user } from '../../actions/Auth'
import EditableAutoClockEntry from './EditableAutoClockEntry'
import Pagination from '../Pagination'

class AutoClockList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, list_key } = this.props
	dispatch(initList(list_key))
        dispatch(update_list_ordering(list_key, { 'start_time': 'desc' }))
        dispatch(update_list_pagination(list_key, { page_size: 8 }))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, list_key, filter, nested_objects, logged_in_user_id } = props
        if ( filter.user_id !== logged_in_user_id ) {
            dispatch(update_list_filter(list_key, {user_id:logged_in_user_id}))
        }
        dispatch(fetchAutoClocksIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    onRefresh(event) {
        const { dispatch, list_key } = this.props
	if ( event ) {
	    event.stopPropagation()
	}
	dispatch(invalidateList(list_key))
	dispatch(fetchAutoClocksIfNeeded(list_key))
    }

    render_row(auto_clock) {
        return (
            <div className="auto-clock-list__row" key={auto_clock.id}>
              <div className={classNames("auto_clock-list__auto_clock_name")} >
                <EditableAutoClockEntry entry_id={auto_clock.id} time_format="datetime" />
              </div>
            </div>
        )
    }

    render() {

        const { auto_clocks_by_id, is_loading, list_key } = this.props

        if ( is_loading && !auto_clocks_by_id && auto_clocks_by_id.length === 0 ) {
            return (
                <div>Loading...</div>
            )
        }

        return (
            <div className="auto-clock-list">
              <Pagination list_key={list_key} on_changed={this.onRefresh} />
              <DivTable>
                { map(values(auto_clocks_by_id), (auto_clock) => this.render_row(auto_clock) ) }
              </DivTable>
              { (!auto_clocks_by_id || auto_clocks_by_id.length) === 0 &&
                (
                    <div className="auto-clock-list__empty">
                      { ! is_loading && "No pages." }
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
    const is_loading = isLoading(state, list_key) || isLoadingItems(state, ENTITY_KEY__AUTO_CLOCK, visible_item_ids)
    const last_updated = getLastUpdated(state, list_key)
    const nested_objects = getNestedObjects(state, list_key)
    const should_fetch_list = shouldFetchList(state, list_key)
    const is_invalidated = areAnyItemsInvalidated(state, ENTITY_KEY__AUTO_CLOCK, visible_item_ids)
    const items_by_id = getAutoClocks(state, visible_item_ids)
    const filter = getListFilter(state, list_key)
    const logged_in_user_id = logged_in_user().user_id || -1

    return {
        auto_clock_ids: visible_item_ids,
        auto_clocks_by_id: items_by_id,
        is_loading,
        is_invalidated,
        should_fetch_list,
        last_updated,
        nested_objects,
        filter,
        logged_in_user_id
    }
}

export default connect(mapStateToProps)(AutoClockList)

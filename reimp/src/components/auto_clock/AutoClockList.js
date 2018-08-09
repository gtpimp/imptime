import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map, values, size, filter as lofilter } from 'lodash'
import classNames from 'classnames'
import {
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
import EditableAutoClockEntry from './EditableAutoClockEntry'
import Pagination from '../Pagination'
import IssueName from '../IssueName'
import { ensureUsersLoaded } from '../../actions/Users'
import { ensureProjectsLoaded } from '../../actions/Projects'
import { ensureSprintsLoaded } from '../../actions/Sprints'
import { ensureIssuesLoaded } from '../../actions/Issues'


class AutoClockList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, list_key } = this.props
        dispatch(update_list_ordering(list_key, { 'start_time': 'desc' }))
        dispatch(update_list_pagination(list_key, { page_size: 50 }))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, list_key, filter, nested_objects, auto_clocks_by_id,
                filter_unallocated, filter_issue_id } = props
        
        if ( filter_unallocated !== undefined && filter.is_unallocated !== filter_unallocated ) {
            dispatch(update_list_filter(list_key, {is_unallocated:filter_unallocated}))
        }
        if ( filter_issue_id !== undefined && filter.issue_id !== filter_issue_id ) {
            dispatch(update_list_filter(list_key, {issue_id:filter_issue_id}))
        }
        if ( filter !== this.props.filter ) {
            dispatch(invalidateList(list_key))
        }

        const all_user_ids = lofilter(map(auto_clocks_by_id, (auto_clock) => auto_clock.user_id), (x) => x !== undefined && x !== null)
        const all_issue_ids = lofilter(map(auto_clocks_by_id, (auto_clock) => auto_clock.issue_id), (x) => x !== undefined && x !== null)
        const all_sprint_ids = lofilter(map(auto_clocks_by_id, (auto_clock) => auto_clock.sprint_id), (x) => x !== undefined && x !== null)
        const all_project_ids = lofilter(map(auto_clocks_by_id, (auto_clock) => auto_clock.project_id), (x) => x !== undefined && x !== null)
        if ( size(all_user_ids)>0 ) { 
            dispatch(ensureUsersLoaded(all_user_ids))
        }
        if ( size(all_issue_ids)>0 ) {
            dispatch(ensureIssuesLoaded(all_issue_ids))
        }
        if ( size(all_sprint_ids)>0 ) {
            dispatch(ensureSprintsLoaded(all_sprint_ids))
        }
        if ( size(all_project_ids)>0 ) {
            dispatch(ensureProjectsLoaded(all_project_ids))
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

        const { auto_clocks_by_id, is_loading, list_key, filter_unallocated, filter_issue_id } = this.props

        if ( is_loading && !auto_clocks_by_id && auto_clocks_by_id.length === 0 ) {
            return (
                <div>Loading...</div>
            )
        }

        return (
            <div className="auto-clock-list">
              { filter_unallocated &&
                <h2>
                  Unallocated time entries.
                </h2>
              }
              { filter_issue_id &&
                <h2>
                  For issue <IssueName issue_id={filter_issue_id} />
                </h2>
              }
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
    const { list_key, filter_unallocated, filter_issue_id } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const is_loading = isLoading(state, list_key) || isLoadingItems(state, ENTITY_KEY__AUTO_CLOCK, visible_item_ids)
    const last_updated = getLastUpdated(state, list_key)
    const nested_objects = getNestedObjects(state, list_key)
    const should_fetch_list = shouldFetchList(state, list_key)
    const is_invalidated = areAnyItemsInvalidated(state, ENTITY_KEY__AUTO_CLOCK, visible_item_ids)
    const items_by_id = getAutoClocks(state, visible_item_ids)
    const filter = getListFilter(state, list_key)

    return {
        auto_clock_ids: visible_item_ids,
        auto_clocks_by_id: items_by_id,
        is_loading,
        is_invalidated,
        should_fetch_list,
        last_updated,
        nested_objects,
        filter,
        filter_unallocated: filter_unallocated || undefined,
        filter_issue_id: filter_issue_id || undefined
    }
}

export default connect(mapStateToProps)(AutoClockList)

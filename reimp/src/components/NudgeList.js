import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import {
    initList,
    invalidateList,
    selectItems,
    collapse_list,
    expand_list,
    shouldFetchList,
    getVisibleItemIds,
    getVisibleItems,
    getNestedObjects,
    ensureNestedObjectsLoaded,
    isLoading,
    getLastUpdated,
    getLoadingItemIds,
    getSelectedItemIds,
    getSelectedItems,
    getDisplayMode,
    update_list_pagination
} from '../actions/ItemList'
import { ENTITY_KEY__NUDGE } from '../actions/ItemListKeyRegistry'
import {
    fetchNudgesIfNeeded
} from '../actions/Nudges'
import { isLoadingItems, areAnyItemsInvalidated } from '../actions/Item'
import Nudge from './Nudge'

class NudgeList extends Component {

    constructor(props) {
        super(props)
    }
    
    componentDidMount() {
	const { dispatch, list_key, nested_objects } = this.props
	dispatch(initList(list_key))
        dispatch(update_list_pagination(list_key, { 'page_size': 10 }))
        dispatch(fetchNudgesIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, list_key, nested_objects } = new_props
        dispatch(fetchNudgesIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    render() {

        const { nudge_ids, is_loading } = this.props
        const that = this

        if ( is_loading ) {
            return (
                <div>Loading...</div>
            )
        }

        return (
            <div className="nudge-list">
              { map(nudge_ids, (nudge_id) =>  <Nudge key={nudge_id} nudge_id={nudge_id} />) }
              { !nudge_ids || nudge_ids.length == 0 &&
                (
                    <div className="nudge-list__empty">
                      No nudges. Go in peace.
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
    const is_loading = isLoading(state, list_key) || isLoadingItems(state, ENTITY_KEY__NUDGE, visible_item_ids)
    const last_updated = getLastUpdated(state, list_key)
    const nested_objects = getNestedObjects(state, list_key)
    const should_fetch_list = shouldFetchList(state, list_key)
    const is_invalidated = areAnyItemsInvalidated(state, ENTITY_KEY__NUDGE, visible_item_ids)

    return {
        nudge_ids: visible_item_ids,
        is_loading,
        is_invalidated,
        should_fetch_list,
        last_updated,
        nested_objects
    }
}

export default connect(mapStateToProps)(NudgeList)

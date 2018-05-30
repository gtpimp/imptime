import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map, includes } from 'lodash'
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
    update_list_format,
    unselectAllItems,
    selectItems,
    getSelectedItemIds
} from '../actions/ItemList'
import { ENTITY_KEY__NUDGE } from '../actions/ItemListKeyRegistry'
import {
    fetchNudgesIfNeeded,
    getAllAvailableNudgeHeaders,
    getNudgeHeaderListForMien,
    updateNudgeMienHeaders,
} from '../actions/Nudges'
import { isLoadingItems, areAnyItemsInvalidated } from '../actions/Item'
import Nudge from './Nudge'
import DivTable from './DivTable'
import MienListColumnConfigurable from './MienListColumnConfigurable'

class NudgeList extends Component {

    constructor(props) {
        super(props)
        this.onChangeNudgeSelection = this.onChangeNudgeSelection.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, list_key, nested_objects } = this.props
	dispatch(initList(list_key))
        dispatch(update_list_pagination(list_key, { 'page_size': 50 }))
        dispatch(update_list_format(list_key, { 'spread': true }))
        dispatch(update_list_ordering(list_key, { 'due_date': 'asc' }))
        dispatch(fetchNudgesIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, list_key, nested_objects } = new_props
        dispatch(fetchNudgesIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    onChangeNudgeSelection(nudge, selected) {
        const { dispatch, list_key, onSelect } = this.props
        dispatch(unselectAllItems(list_key))
        dispatch(selectItems(list_key, [nudge.id]))
        onSelect(nudge)
    }

    render() {

        const { nudge_ids, is_loading, header_list, selected_item_ids } = this.props
        const that = this

        if ( (is_loading && !nudge_ids && nudge_ids.length) === 0 ) {
            return (
                <div>Loading...</div>
            )
        }

        if ( !nudge_ids || nudge_ids.length === 0 ) {
            return (
                <div className="nudge-list__empty">
                  { ! is_loading && "No nudges. Go in peace." }
                </div>
            )
        }

        return (
            <MienListColumnConfigurable getAvailableHeaders={getAllAvailableNudgeHeaders}
                                        getHeaderListForMien={getNudgeHeaderListForMien}
                                        updateMienHeaders={updateNudgeMienHeaders}
                                        header_list_name="nudge"
            >
              <DivTable header_list={header_list}>
                {map(nudge_ids, (nudge_id) =>
                    <Nudge key={nudge_id}
                           nudge_id={nudge_id}
                           onChangeSelection={that.onChangeNudgeSelection}
                           is_selected={includes(selected_item_ids, nudge_id)}
                           header_list={header_list}/>
                 )}
              </DivTable>
            </MienListColumnConfigurable>
        )
    }
}

function mapStateToProps(state, props) {
    const { list_key, header_list, onSelect } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const is_loading = isLoading(state, list_key) || isLoadingItems(state, ENTITY_KEY__NUDGE, visible_item_ids)
    const last_updated = getLastUpdated(state, list_key)
    const nested_objects = getNestedObjects(state, list_key)
    const should_fetch_list = shouldFetchList(state, list_key)
    const is_invalidated = areAnyItemsInvalidated(state, ENTITY_KEY__NUDGE, visible_item_ids)
    const selected_item_ids = getSelectedItemIds(state, list_key)

    return {
        nudge_ids: visible_item_ids,
        is_loading,
        is_invalidated,
        should_fetch_list,
        last_updated,
        nested_objects,
        header_list,
        selected_item_ids,
        onSelect
    }
}

export default connect(mapStateToProps)(NudgeList)

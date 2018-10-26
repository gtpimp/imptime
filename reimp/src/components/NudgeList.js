import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map, includes } from 'lodash'
import {
    initList,
    shouldFetchList,
    getVisibleItemIds,
    getVisibleItems,
    getNestedObjects,
    ensureNestedObjectsLoaded,
    isLoading,
    getLastUpdated,
    update_list_pagination,
    unselectAllItems,
    selectItems,
    getSelectedItemIds,
    invalidateList
} from '../actions/ItemList'
import {
    ENTITY_KEY__NUDGE,
    HEADER_LIST_NAME__NUDGE
} from '../actions/ItemListKeyRegistry'
import {
    fetchNudgesIfNeeded,
    reorderNudge,
    ALL_AVAILABLE_NUDGE_HEADERS
} from '../actions/Nudges'
import { isLoadingItems, areAnyItemsInvalidated } from '../actions/Item'
import Nudge from './Nudge'
import DivTable from './DivTable'
import MienListColumnConfigurable from './MienListColumnConfigurable'
import Pagination from '../components/Pagination'

class NudgeList extends Component {

    constructor(props) {
        super(props)
        this.onChangeNudgeSelection = this.onChangeNudgeSelection.bind(this)
        this.reorderNudge = this.reorderNudge.bind(this)
        this.onChangePage = this.onChangePage.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, list_key, nested_objects } = this.props
	dispatch(initList(list_key))
        dispatch(update_list_pagination(list_key, { 'page_size': 50 }))

        //// Keeping these files while I figure what a good ordering is
        // dispatch(update_list_format(list_key, { 'spread': false }))
        // dispatch(update_list_ordering(list_key, { 'due_date': 'asc' }))
        ////
        
        dispatch(fetchNudgesIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, list_key, nested_objects } = new_props
        dispatch(fetchNudgesIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    onChangePage() {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(fetchNudgesIfNeeded(list_key))
    }
    
    onChangeNudgeSelection(nudge, selected) {
        const { dispatch, list_key, onSelect } = this.props
        dispatch(unselectAllItems(list_key))
        dispatch(selectItems(list_key, [nudge.id]))
        onSelect(nudge)
    }

    reorderNudge(index_of_row_being_moved, index_of_destination) {
        const {dispatch, list_key, nudges, selected_item_ids} = this.props

        // get nudge being moved
        const moving_nudge_id = nudges[index_of_row_being_moved].id
        if ( ! moving_nudge_id ) {
            return
        }
        let selected_ids = selected_item_ids || []
        if ( ! includes(selected_ids, moving_nudge_id) ) {
            selected_ids = [moving_nudge_id]
        }

        // get place to move it
        let move_after_nudge_id
        if ( index_of_row_being_moved > index_of_destination ) {
            move_after_nudge_id = (index_of_destination>0 && nudges[index_of_destination-1].id) || null
        } else {
            move_after_nudge_id = nudges[index_of_destination].id || null
        }

        dispatch(reorderNudge(selected_ids, move_after_nudge_id, list_key,
                              index_of_destination,
                              function () {
                                  dispatch(invalidateList(list_key))
                                  dispatch(fetchNudgesIfNeeded(list_key))
                              }))
    }

    render() {

        const { list_key, nudge_ids, is_loading, selected_item_ids, onShowMoreIssues } = this.props
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
            <MienListColumnConfigurable all_headers={ALL_AVAILABLE_NUDGE_HEADERS}
                                        header_list_name={HEADER_LIST_NAME__NUDGE}
            >
              {({active_headers}) => (
                   <div>
                     <Pagination list_key={list_key}
                                 on_changed={this.onChangePage} />
                     
                     <DivTable header_list={active_headers}
                               onReorder={that.reorderNudge}
                     >
                       {map(nudge_ids, (nudge_id) =>
                           <Nudge key={nudge_id}
                                  nudge_id={nudge_id}
                                  onChangeSelection={that.onChangeNudgeSelection}
                                  onShowMoreIssues={onShowMoreIssues}
                                  is_selected={includes(selected_item_ids, nudge_id)}
                                  header_list={active_headers}/>
                        )}
                     </DivTable>
                   </div>
               )}
            </MienListColumnConfigurable>
        )
    }
}

function mapStateToProps(state, props) {
    const { list_key, onSelect, onShowMoreIssues } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const nudges = getVisibleItems(state, list_key, ENTITY_KEY__NUDGE)
    const is_loading = isLoading(state, list_key) || isLoadingItems(state, ENTITY_KEY__NUDGE, visible_item_ids)
    const last_updated = getLastUpdated(state, list_key)
    const nested_objects = getNestedObjects(state, list_key)
    const should_fetch_list = shouldFetchList(state, list_key)
    const is_invalidated = areAnyItemsInvalidated(state, ENTITY_KEY__NUDGE, visible_item_ids)
    const selected_item_ids = getSelectedItemIds(state, list_key)

    return {
        nudge_ids: visible_item_ids,
        nudges,
        is_loading,
        is_invalidated,
        should_fetch_list,
        last_updated,
        nested_objects,
        selected_item_ids,
        onSelect,
        onShowMoreIssues
    }
}

export default connect(mapStateToProps)(NudgeList)

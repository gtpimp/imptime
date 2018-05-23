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
import {
    isMienConfigurerActive,
    getMienBeingConfigured,
    updateMienNudgeHeaders,
    getNudgeHeaderListForMien
} from '../actions/Mien'
import { ENTITY_KEY__NUDGE } from '../actions/ItemListKeyRegistry'
import {
    fetchNudgesIfNeeded,
    getAllAvailableNudgeHeaders
} from '../actions/Nudges'
import { isLoadingItems, areAnyItemsInvalidated } from '../actions/Item'
import Nudge from './Nudge'
import DivTable from './DivTable'
import ListColumnConfigurer from './ListColumnConfigurer'

class NudgeList extends Component {

    constructor(props) {
        super(props)
        this.onListColumnConfigurerSaved = this.onListColumnConfigurerSaved.bind(this)
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

    onListColumnConfigurerSaved(new_active_headers) {
        const { dispatch, mien_being_configured } = this.props
        dispatch(updateMienNudgeHeaders(mien_being_configured.id, new_active_headers))
    }

    renderListColumnConfigurer() {
        const { mien_being_configured } = this.props
        if ( ! mien_being_configured ) {
            return null
        }
        return (
            <ListColumnConfigurer all_headers={getAllAvailableNudgeHeaders()}
                                  onSave={this.onListColumnConfigurerSaved}
                                  name="nudge"
                                  active_headers={getNudgeHeaderListForMien(mien_being_configured)} />
        )
    }

    render() {

        const { nudge_ids, is_loading, header_list, is_mien_configurer_active } = this.props

        if ( is_mien_configurer_active ) {
            return this.renderListColumnConfigurer()
        }
        
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
            <DivTable header_list={header_list}>
              {map(nudge_ids, (nudge_id) =>
                  <Nudge key={nudge_id} nudge_id={nudge_id} header_list={header_list}/>
               )}
            </DivTable>
        )
    }
}

function mapStateToProps(state, props) {
    const { list_key, header_list } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const is_loading = isLoading(state, list_key) || isLoadingItems(state, ENTITY_KEY__NUDGE, visible_item_ids)
    const last_updated = getLastUpdated(state, list_key)
    const nested_objects = getNestedObjects(state, list_key)
    const should_fetch_list = shouldFetchList(state, list_key)
    const is_invalidated = areAnyItemsInvalidated(state, ENTITY_KEY__NUDGE, visible_item_ids)
    const is_mien_configurer_active = isMienConfigurerActive(state)
    const mien_being_configured = getMienBeingConfigured(state)

    return {
        nudge_ids: visible_item_ids,
        is_loading,
        is_invalidated,
        should_fetch_list,
        last_updated,
        nested_objects,
        header_list,
        is_mien_configurer_active,
        mien_being_configured
    }
}

export default connect(mapStateToProps)(NudgeList)

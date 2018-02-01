import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map, values } from 'lodash'
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
    update_list_pagination,
    update_list_ordering,
    update_list_format
} from '../actions/ItemList'
import { ENTITY_KEY__WIKI } from '../actions/ItemListKeyRegistry'
import {
    fetchWikisIfNeeded, getWikis
} from '../actions/Wikis'
import DivTable from './DivTable'
import { isLoadingItems, areAnyItemsInvalidated } from '../actions/Item'
import Wiki from './Wiki'

class WikiList extends Component {

    constructor(props) {
        super(props)
    }
    
    componentDidMount() {
	const { dispatch, list_key, nested_objects } = this.props
	dispatch(initList(list_key))
        dispatch(update_list_ordering(list_key, { 'name': 'asc' }))
        dispatch(fetchWikisIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, list_key, nested_objects } = new_props
        dispatch(fetchWikisIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    render_row(wiki) {
        return (
            <div className="wiki-list__row" key={wiki.id}>
              <div className="wiki-list__wiki_name"
                   onClick={(event) => this.onSelectWiki(event, wiki.id)}>
                {wiki.name}
              </div>
            </div>
        )
    }

    render() {

        const { wikis_by_id, is_loading } = this.props
        const that = this

        if ( is_loading && !wikis_by_id && wikis_by_id.length == 0 ) {
            return (
                <div>Loading...</div>
            )
        }

        return (
            <div className="wiki-list">
              <DivTable>
                { map(values(wikis_by_id), (wiki) => this.render_row(wiki) ) }
              </DivTable>
              { !wikis_by_id || wikis_by_id.length == 0 &&
                (
                    <div className="wiki-list__empty">
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
    const is_loading = isLoading(state, list_key) || isLoadingItems(state, ENTITY_KEY__WIKI, visible_item_ids)
    const last_updated = getLastUpdated(state, list_key)
    const nested_objects = getNestedObjects(state, list_key)
    const should_fetch_list = shouldFetchList(state, list_key)
    const is_invalidated = areAnyItemsInvalidated(state, ENTITY_KEY__WIKI, visible_item_ids)
    const items_by_id = getWikis(state, visible_item_ids)

    return {
        wiki_ids: visible_item_ids,
        wikis_by_id: items_by_id,
        is_loading,
        is_invalidated,
        should_fetch_list,
        last_updated,
        nested_objects
    }
}

export default connect(mapStateToProps)(WikiList)

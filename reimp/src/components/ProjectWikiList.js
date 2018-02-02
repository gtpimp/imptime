import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map, values, includes } from 'lodash'
import classNames from 'classnames'
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
    update_list_format,
    update_list_filter,
    getListFilter
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
        this.onSelectWiki = this.onSelectWiki.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, list_key, filter, nested_objects } = this.props
	dispatch(initList(list_key))
        dispatch(update_list_ordering(list_key, { 'name': 'asc' }))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, list_key, project_id, filter, nested_objects } = props
        if ( filter.project_id != project_id ) {
            dispatch(update_list_filter(list_key, {project_id:project_id}))
        }
        dispatch(fetchWikisIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    onSelectWiki(event, wiki_id) {
        const { onSelectWiki } = this.props
        onSelectWiki(wiki_id)
        event.stopPropagation()
    }

    render_row(wiki) {
        const { selected_wiki_ids } = this.props
        const is_selected = includes(selected_wiki_ids, ""+wiki.id)
        return (
            <div className="wiki-list__row" key={wiki.id}>
              <div className={classNames("wiki-list__wiki_name",
                                         {"div-table__row--selected":is_selected})}
                   onClick={(event) => this.onSelectWiki(event, wiki.id)}>
                {wiki.name}
              </div>
              { wiki.money_sensitive &&
                <div className="icon--commercially-sensitive"/>
              }
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
    const { list_key, selected_wiki_ids, project_id } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const is_loading = isLoading(state, list_key) || isLoadingItems(state, ENTITY_KEY__WIKI, visible_item_ids)
    const last_updated = getLastUpdated(state, list_key)
    const nested_objects = getNestedObjects(state, list_key)
    const should_fetch_list = shouldFetchList(state, list_key)
    const is_invalidated = areAnyItemsInvalidated(state, ENTITY_KEY__WIKI, visible_item_ids)
    const items_by_id = getWikis(state, visible_item_ids)
    const filter = getListFilter(state, list_key)

    return {
        wiki_ids: visible_item_ids,
        wikis_by_id: items_by_id,
        is_loading,
        is_invalidated,
        should_fetch_list,
        last_updated,
        nested_objects,
        selected_wiki_ids,
        project_id,
        filter
    }
}

export default connect(mapStateToProps)(WikiList)

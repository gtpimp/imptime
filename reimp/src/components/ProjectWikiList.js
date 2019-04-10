import React, { Component } from 'react'
import { connect } from 'react-redux'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import { map, values, includes } from 'lodash'
import classNames from 'classnames'
import { has_permission } from '../actions/Users'
import {
    initList,
    shouldFetchList,
    getVisibleItemIds,
    getNestedObjects,
    ensureNestedObjectsLoaded,
    isLoading,
    getLastUpdated,
    update_list_ordering,
    update_list_filter,
    getListFilter
} from '../actions/ItemList'
import { ENTITY_KEY__WIKI } from '../actions/ItemListKeyRegistry'
import {
    fetchWikisIfNeeded, getWikis, deleteWiki
} from '../actions/Wikis'
import {
    makeSelWikisAsStructuredTree
} from '../selectors/WikiListSelectors'
import DivTable from './DivTable'
import { isLoadingItems, areAnyItemsInvalidated } from '../actions/Item'

class WikiList extends Component {

    constructor(props) {
        super(props)
        this.onSelectWiki = this.onSelectWiki.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, list_key } = this.props
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
        if ( filter.project_id !== project_id ) {
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

    onDeleteWiki(event, wiki_id) {
        const { dispatch } = this.props
        if ( ! window.confirm("Are you sure you want to delete this wiki?") ) {
            return
        }
        dispatch(deleteWiki(wiki_id))
    }

    render_row(wiki) {
        const { selected_wiki_ids, can_delete } = this.props
        const is_selected = includes(selected_wiki_ids, ""+wiki.id)
        return (
            <div className={classNames("wiki-list__row",
                           {"div-table__row--selected":is_selected})}
                 key={wiki.id}>
              <div className="wiki-list__wiki_name"
                   onClick={(event) => this.onSelectWiki(event, wiki.id)}>
                {wiki.name}
                { wiki.money_sensitive &&
                  <PermissionInspectorHighlighter project_id={wiki.project_id}
                                                  permission_name='has_view_ctc_billable_rates'>
                    <div className="icon--commercially-sensitive"/>
                  </PermissionInspectorHighlighter>
                }
                { wiki.store_encrypted &&
                  <div className="icon--secure"/>
                }
              </div>
              <div className="wiki-list__row_buttons">
                { can_delete &&
                  <div onClick={(event) => this.onDeleteWiki(event, wiki.id)} className="icon--small-delete"/>
                }
              </div>
            </div>
        )
    }

    render() {

        const { wikis_by_id, is_loading, project_id } = this.props

        if ( (is_loading && !wikis_by_id && wikis_by_id.length) === 0 ) {
            return (
                <div>Loading...</div>
            )
        }

        return (
            <div className="wiki-list">
              <DivTable project_id={project_id} permission_name_for_dragging={'xxx'}>
                { map(values(wikis_by_id), (wiki) => this.render_row(wiki) ) }
              </DivTable>
              { (!wikis_by_id || wikis_by_id.length) === 0 &&
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

const makeMapStateToProps = () => {
    const selWikisAsStructuredTree = makeSelWikisAsStructuredTree()
    
    const mapStateToProps = (state, props) => {
        const { list_key, selected_wiki_ids, project_id } = props
        const visible_item_ids = getVisibleItemIds(state, list_key)
        const is_loading = isLoading(state, list_key) || isLoadingItems(state, ENTITY_KEY__WIKI, visible_item_ids)
        const last_updated = getLastUpdated(state, list_key)
        const nested_objects = getNestedObjects(state, list_key)
        const should_fetch_list = shouldFetchList(state, list_key)
        const is_invalidated = areAnyItemsInvalidated(state, ENTITY_KEY__WIKI, visible_item_ids)
        const items_by_id = getWikis(state, visible_item_ids)
        const filter = getListFilter(state, list_key)
        const can_delete = has_permission(state, project_id, 'has_edit_business_comments')
        const wikis_as_structured_tree = selWikisAsStructuredTree(state, props)

        return {
            wiki_ids: visible_item_ids,
            wikis_by_id: items_by_id,
            wikis_as_structured_tree,
            is_loading,
            is_invalidated,
            should_fetch_list,
            last_updated,
            nested_objects,
            selected_wiki_ids,
            project_id,
            filter,
            can_delete
        }
    }
    return mapStateToProps
}

export default connect(makeMapStateToProps)(WikiList)

import { createSelector } from 'reselect'
import {
    ENTITY_KEY__WIKI,
} from '../actions/ItemListKeyRegistry'
import { get, map, includes, values, sortBy } from 'lodash'
import { getTreeFromFlatData } from 'react-sortable-tree'

const selGetAllWikisById = (state, props) => {
    return get(state, ["item", ENTITY_KEY__WIKI, "items_by_id"], null)
}

const selGetSelectedWikiIds = (state, props) => {
    return get(state, ["item_list", props.list_key, "selected_ids"], null)
}

const selGetTransientWikiValuesById = (state, props) => {
    return get(state, ["item", ENTITY_KEY__WIKI, "transient_values_by_id"], null)
}

const helperCreateStructuredTree = (all_wikis_by_id, selected_wiki_ids, transient_values_by_id) => {
    
    if ( ! all_wikis_by_id ) {
        return []
    }
    map(all_wikis_by_id, function(wiki) {
        wiki.selected = includes(selected_wiki_ids, wiki.id)
        wiki.title = `${wiki.name}_id${wiki.id}__order${wiki.order}__selected${wiki.selected}`
        wiki.title = wiki.name
        wiki.subtitle = ""
        wiki.expanded = get(transient_values_by_id, [wiki.id, "expanded"], false)
    })
    let tree = getTreeFromFlatData({flatData: values(all_wikis_by_id),
                                    getKey: (node) => node.id,
                                    getParentKey: (node) => node.parent_id,
                                    rootKey: null})
    tree = recursivelySortTree(tree)
    return tree
}

export const makeSelWikisAsStructuredTree = () => {
    return createSelector(
        [ selGetAllWikisById, selGetSelectedWikiIds, selGetTransientWikiValuesById ],
        ( all_wikis_by_id, selected_wiki_ids, transient_values_by_id ) => {
            const tree = helperCreateStructuredTree(all_wikis_by_id, selected_wiki_ids, transient_values_by_id)
            return tree
        }
    )
}

function recursivelySortTree(nodes) {
    nodes = sortBy(nodes, (node) => (node && node.order) || 0)
    map(nodes, (node) => {
        node.children = recursivelySortTree(node.children)
    })
    return nodes
}


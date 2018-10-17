import { impfetch } from './lib.js'
import { get, indexOf, keys, map, compact, difference, includes } from 'lodash'
import move from 'lodash-move'
import { GENERIC_ENTITIES } from './ItemListKeyRegistry'

import { ensureProjectsLoaded } from './Projects'
import { ensureSprintsLoaded } from './Sprints'
import { ensureIssuesLoaded } from './Issues'
import { ensureUsersLoaded } from './Users'
export const INIT_LIST = 'INIT_LIST'
export const SET_LIST_FLAG = "SET_LIST_FLAG"
export const ANNOUNCE_LIST_LOADED = 'ANNOUNCE_LIST_LOADED'
export const ANNOUNCE_LIST_LOAD_FAILED = 'ANNOUNCE_LIST_LOAD_FAILED'
export const ANNOUNCE_LIST_LOADING = 'ANNOUNCE_LIST_LOADING'
export const ANNOUNCE_MATCHING_ITEMS_LOADED = 'ANNOUNCE_MATCHING_ITEMS_LOADED'
export const ANNOUNCE_MATCHING_ITEMS_LOAD_FAILED = 'ANNOUNCE_MATCHING_ITEMS_LOAD_FAILED'
export const ANNOUNCE_MATCHING_ITEMS_LOADING = 'ANNOUNCE_MATCHING_ITEMS_LOADING'
export const SET_ITEMS_FLAG = 'SET_ITEMS_FLAG'
export const INVALIDATE_LIST = 'INVALIDATE_LIST'
export const UPDATE_LIST_PAGINATION = 'UPDATE_LIST_PAGINATION'
export const UPDATE_LIST_FILTER = 'UPDATE_LIST_FILTER'
export const CLEAR_LIST_FILTER_OPTION = 'CLEAR_LIST_FILTER_OPTION'
export const UPDATE_LIST_FORMAT = 'UPDATE_LIST_FORMAT'
export const UPDATE_LIST_SELECTION = 'UPDATE_LIST_SELECTION'
export const UPDATE_LIST_DISPLAY_MODE = 'UPDATE_LIST_DISPLAY_MODE'
export const UPDATE_LIST_ORDERING = 'UPDATE_LIST_ORDERING'
export const UPDATE_VISIBLE_ITEM_IDS = 'UPDATE_VISIBLE_ITEM_IDS'
export const HIGHLIGHT_LIST_SELECTION = 'HIGHLIGHT_LIST_SELECTION'
export const SET_CURSOR_ITEM = 'SET_CURSOR_ITEM'

export function initList(list_key) {
    return {
        type: INIT_LIST,
        list_key: list_key
    }
}

export function update_list_pagination(list_key, pagination) {
    return {
        type: UPDATE_LIST_PAGINATION,
        list_key: list_key,
        pagination: pagination
    }
}

export function update_list_filter(list_key, filter) {
    return (dispatch, getState) => {
        dispatch({
            type: UPDATE_LIST_FILTER,
            list_key: list_key,
            filter: filter
        })
        dispatch(invalidateList(list_key))
    }
}

export function clear_list_filter_option(list_key, filter_option) {
    return (dispatch, getState) => {
        dispatch({
            type: CLEAR_LIST_FILTER_OPTION,
            list_key: list_key,
            filter_option: filter_option
        })
        dispatch(invalidateList(list_key))
    }
}

export function getListFilter(state, list_key) {
    return (((state || {}).item_list || {})[list_key] ||  {}).filter || {}
}

export function getListPagination(state, list_key) {
    return (((state || {}).item_list || {})[list_key] ||  {}).pagination || {}
}

export function update_list_ordering(list_key, ordering) {
    return (dispatch, getState) => {
        dispatch({
            type: UPDATE_LIST_ORDERING,
            list_key: list_key,
            ordering: ordering
        })
        dispatch(invalidateList(list_key))
    }
}

export function get_list_ordering(state, list_key) {
    return ((state.item_list || {})[list_key] || {}).ordering
}

export function update_list_format(list_key, format) {
    return (dispatch, getState) => {
        dispatch({
            type: UPDATE_LIST_FORMAT,
            list_key: list_key,
            format: format
        })
        dispatch(invalidateList(list_key))
    }
}

export function collapse_list(list_key) {
    return setDisplayMode(list_key, 'collapsed')
}

export function expand_list(list_key) {
    return setDisplayMode(list_key, 'expanded')
}

export function setDisplayMode(list_key, display_mode) {
    return {
        type: UPDATE_LIST_DISPLAY_MODE,
        list_key: list_key,
        display_mode: display_mode
    }
}

export function getDisplayMode(state, list_key) {
    return ((state.item_list || {})[list_key] || {}).display_mode
}

export function updateVisibleItemIdAbove(list_key, item_ids_to_move, item_id_to_move_after, index_of_destination) {
    // just changes it in redux, if you want to hit the server, do that somewhere else
    return (dispatch, getState) => {
        const state = getState()
        const item_ids = getVisibleItemIds(state, list_key)

        let reordered_item_ids = item_ids
        map(item_ids_to_move, function(item_id_to_move) {
            const index_of_item_id_to_move = indexOf(item_ids, item_id_to_move)
            reordered_item_ids = move(reordered_item_ids, index_of_item_id_to_move, index_of_destination)
        })

        dispatch({
            type: UPDATE_VISIBLE_ITEM_IDS,
            list_key: list_key,
            visible_item_ids: reordered_item_ids
        })
        console.log("updateVisibleItemIdAbove. Before=" + item_ids + ". After=" + reordered_item_ids)
    }
}


export function unselectAllItems(list_key) {
    return {
        type: UPDATE_LIST_SELECTION,
        list_key: list_key,
        selected_ids: []
    }
}

export function selectItems(list_key, selected_ids) {

    return {
        type: UPDATE_LIST_SELECTION,
        list_key: list_key,
        selected_ids: selected_ids
    }
}

export function setCursorItem(list_key, item_id) {
    return {
        type: SET_CURSOR_ITEM,
        list_key: list_key,
        cursor_item_id: item_id
    }
}

export function getCursorItemId(state, list_key) {
    return (((state || {}).item_list || {})[list_key] || {}).cursor_item_id
}

export function highlightItems(list_key, highlighted_ids) {

    return {
        type: HIGHLIGHT_LIST_SELECTION,
        list_key: list_key,
        highlighted_ids: highlighted_ids
    }
}

export function getHighlightedItemIds(state, list_key) {
    return get(state, ["item_list", list_key, "highlighted_ids"])
}

export function setListFlag(list_key, flag_name, flag_value) {
    // sets a single global value on the list
    return {
        type: SET_LIST_FLAG,
        list_key: list_key,
        flag_name: flag_name,
        flag_value: flag_value
    }
}

export function getListFlag(state, list_key, flag_name, default_value) {
    return get(state, ["item_list", list_key, flag_name], default_value)
}

export function setItemFlag(list_key, selected_ids, flag_name, flag_value) {
    // updates a list of selected_ids to a flag called flag_name. 
    // if flag_value is true, the selected_ids are added to the flag list, 
    // if false they are removed
    return {
        type: SET_ITEMS_FLAG,
        list_key: list_key,
        selected_ids: selected_ids,
        flag_name: flag_name,
        flag_value: flag_value
    }
}

export function getItemFlag(state, list_key, flag_name) {
    return (((state || {}).item_list || {})[list_key] || {})[flag_name]
}

export function invalidateList(list_key) {
    return {
        type: INVALIDATE_LIST,
        list_key: list_key
    }
}

function announceListLoading(list_key) {
    return {
        type: ANNOUNCE_LIST_LOADING,
        list_key: list_key
    }
}

function announceMatchingItemsLoading(list_key) {
    return {
        type: ANNOUNCE_MATCHING_ITEMS_LOADING,
        list_key: list_key
    }
}

function announceListLoaded(list_key, payload, nested_objects) {

    return {
        type: ANNOUNCE_LIST_LOADED,
        visible_item_ids: payload.ids,
        nested_objects: nested_objects,
        pagination: payload.pagination,
        list_key: list_key,
        received_at: Date.now()
    }
}

function announceMatchingItemsLoaded(list_key) {

    return {
        type: ANNOUNCE_MATCHING_ITEMS_LOADED,
        list_key: list_key,
        received_at: Date.now()
    }
}

function announceListLoadFailed(list_key,error) {
    return {
        type: ANNOUNCE_LIST_LOAD_FAILED,
        list_key: list_key,
        error: error,
        received_at: Date.now()
    }
}

function announceMatchingItemsLoadFailed(list_key, error) {
    return {
        type: ANNOUNCE_MATCHING_ITEMS_LOAD_FAILED,
        list_key: list_key,
        error: error,
        received_at: Date.now()
    }
}

function tryFetchMatchingItems(list_key,
                               required_item_ids,
                               matching_items_key,
                               matching_items_promise_func,
                               is_generic_item) {
    // The second half of tryFetchListAndItems, separated out for clarity

    return (dispatch, getState) => {

        if ( ! required_item_ids ) {
            return
        }

        const state = getState()
        let item_state = state
        if ( is_generic_item ) {
            item_state = item_state.item
        }
        const l = (state.item_list || {})[list_key] || {}
        if ( l.loading_matching_items ) {
            return
        }

        const unmatching_item_ids = getMissingItemIds(item_state, required_item_ids, matching_items_key)
        if ( unmatching_item_ids.length > 0 ) {
            dispatch(announceMatchingItemsLoading(list_key))
            matching_items_promise_func(dispatch, state, unmatching_item_ids)
                .then(() => {
                    dispatch(announceMatchingItemsLoaded(list_key))
                })
                .catch(function (error) {
                    dispatch(announceMatchingItemsLoadFailed(list_key, "Failed to load entity list: " + error))
                })
        }
    }
}

function _stringify_id(id) {
    return "d" + id
}

function _unstringify_id(id) {
    return id.substr(1)
}

export function getMissingItemIds(state, required_item_ids, matching_items_key) {
    // Returns a list of item_ids which aren't already loaded or invalidated or already loading

    // const matching_item_refs = forEach(matching_item_ids, function(item_id, index) { return "" + item_id })

    // take required
    // remove those that are loading
    // get the existing list that isn't invalidated

    const required_item_refs = map(required_item_ids, _stringify_id)
    const items = state[matching_items_key] || {}

    let item_ids_to_load = required_item_refs

    // remove items being loaded
    const loading_item_ids = map(items.loading_item_ids || [], _stringify_id)
    item_ids_to_load = difference(item_ids_to_load, loading_item_ids)

    // get the list of all un-invalidated items
    const existing_item_ids = map(keys(items.items_by_id || {}), _stringify_id)
    const invalidated_item_ids = map(items.invalidated_item_ids || [], _stringify_id)
    const uninvalidated_item_ids = difference(existing_item_ids, invalidated_item_ids)

    // remove all un-invalidated items
    item_ids_to_load = difference(item_ids_to_load, uninvalidated_item_ids)

    // remove nulls and convert back to original ids
    item_ids_to_load = compact(item_ids_to_load)
    item_ids_to_load = map(item_ids_to_load, _unstringify_id)

    return difference(item_ids_to_load, ["undefined"])
}

function tryFetchListAndItems(list_key, matching_items_key, matching_items_promise_func, args) {

    // First tries to fetch the list of items, and then fetches all
    // missing matching items

    let { fetch_item_ids_url, is_generic_item } = args || {}
    fetch_item_ids_url = fetch_item_ids_url || 'imp/' + matching_items_key + '/'

    return (dispatch, getState) => {
        const state = getState()

        const item_list = state.item_list || {}
        const l = item_list[list_key] || {}

        if ( ! shouldFetchList(state, list_key) ) {
            const visible_item_ids = l.visible_item_ids
            if ( visible_item_ids ) {
                dispatch(tryFetchMatchingItems(list_key,
                                               visible_item_ids,
                                               matching_items_key,
                                               matching_items_promise_func,
                                               is_generic_item))
            }
            return null
        }

        dispatch(announceListLoading(list_key))

        const format = l.format || {}
        format.ids_only = true

        const params = { filter: l.filter || {},
                         format: format,
                         ordering: l.ordering || {},
                         detail_level: l.detail_level || {},
                         pagination: l.pagination || {} }
        return impfetch(state, fetch_item_ids_url, dispatch, {params:params})
            .then(response => response.json())
            .then(json => {
                if (json.status !== 'success') {
                    dispatch(announceListLoadFailed(list_key, json.error))
                } else {
                    dispatch(announceListLoaded(list_key, json.payload, json.nested_objects || {}))
                    const required_item_ids = json.payload.ids || []
                    dispatch(tryFetchMatchingItems(list_key,
                                                   required_item_ids,
                                                   matching_items_key,
                                                   matching_items_promise_func,
                                                   is_generic_item))
                }
            })
            .catch(function (error) {
                dispatch(announceListLoadFailed(list_key,"Failed to load list: " + list_key + " : " + error))
            })
    }
}

export function shouldFetchList(state, list_key) {

    const item_list = state.item_list || {}
    const l = item_list[list_key] || {}
    if ( l.items_invalidated ) {
        return true
    }
    if( l.is_loading ) {
        return false
    }
    if ( ! l.visible_item_ids ) {
        return true
    }
    return false
}

export function fetchListIfNeeded(list_key,
                                  matching_items_key,
                                  matching_items_promise_func,
                                  args) {

    return tryFetchListAndItems(list_key,
                                matching_items_key,
                                matching_items_promise_func,
                                args)
}

export function getVisibleItemIds(state, list_key) {
    const item_list = ((state || {}).item_list || {})[list_key] || {}
    const visible_item_ids = item_list.visible_item_ids || []
    return visible_item_ids
}

export function getNestedObjects(state, list_key) {
    const item_list = ((state || {}).item_list || {})[list_key] || {}
    return  item_list.nested_objects || {}
}

export function ensureNestedObjectsLoaded(nested_objects) {
    return (dispatch, getState) => {
        map(nested_objects, function(ids, id_name) {
            if ( id_name === "project_ids" ) {
                dispatch(ensureProjectsLoaded(ids))
            } else if ( id_name === "sprint_ids" ) {
                dispatch(ensureSprintsLoaded(ids))
            } else if ( id_name === "issue_ids" ) {
                dispatch(ensureIssuesLoaded(ids))
            } else if ( id_name === "user_ids" ) {
                dispatch(ensureUsersLoaded(ids))
            } 
        })
    }
}

function getItemsById(state, entity_key) {
    const is_generic_item = includes(GENERIC_ENTITIES, entity_key)
    if ( is_generic_item === true ) {
        return (((state || {}).item || {})[entity_key] || {}).items_by_id || {}
    } else {
        return ((state || {})[entity_key] || {}).items_by_id || {}
    }
}

export function getVisibleItems(state, list_key, entity_key) {
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const items_by_id = getItemsById(state, entity_key)

    return (items_by_id && visible_item_ids.map( function(visible_item_id, index) {
        return items_by_id[visible_item_id] || { 'id': visible_item_id,
                                                 'loaded': false }
    })) || []
}

export function getSelectedItemId(state, list_key) {
    const item_ids = getSelectedItemIds(state, list_key)
    if ( item_ids && item_ids.length > 0 ) {
        return item_ids[0]
    }
    return null
}

export function getSelectedItemIds(state, list_key) {
    const item_list = ((state || {}).item_list || {})[list_key] || {}
    const selected_item_ids = item_list.selected_ids || []
    return selected_item_ids
}

export function getSelectedItems(state, list_key, entity_key) {
    const selected_item_ids = getSelectedItemIds(state, list_key)
    const items_by_id = getItemsById(state, entity_key)
    return (items_by_id && selected_item_ids.map( function(selected_item_id, index) {
        return items_by_id[selected_item_id] || { 'id': selected_item_id,
                                                  'loaded': false }
    })) || []
}

export function isLoading(state, list_key) {
    return get(state, ["item_list", list_key, "is_loading"], true) ||
           get(state, ["item_list", list_key, "loading_matching_items"], true)
}

export function isInvalidated(state, list_key) {
    return !(state.item_list && state.item_list[list_key] && !state.item_list[list_key].items_invalidated)
}

export function getLastUpdated(state, list_key) {
    return (state.item_list || {}).last_updated || null
}

export function getLoadingItemIds(state, list_key) {
    return get(state, ["item_list", list_key, "loading_item_ids"], [])
}

export function haveItemsBeenRetrieved(state, ids, entity_key) {
    // useful for api calls which return objects referring to many sprint or project etc. (eg project_dashboard)
    // these api calls usually return a list of these secondary objects and the component can then load them in one go,
    // instead of triggering them piecemeal.
    // This function is used to check if those secondary objects have been retrieved, and so the rest of the rendering can continue.
    // It does not attempt to check invalidation or loading flags, since its purpose is just to check if the bulk loads have been completed.
    if ( !ids || ids.length === 0 ) {
        return true
    }
    const items = getItemsById(state, entity_key)
    const sample_item = items[ids[0]]
    return sample_item !== undefined
}

export function isListReadyToDisplay(state, list_key) {
    return isLoading(state, list_key) !== true
}

export function areItemsReadyToDisplay(state, list_key) {
    return isListReadyToDisplay(state, list_key) === true &&
           isInvalidated(state, list_key) !== true &&
           getLoadingItemIds(state, list_key).length === 0
}

import {ISSUE_HEADER_LIST_WIDE,
        ISSUE_HEADER_LIST_NARROW,
        PAGE_KEY__ISSUES_PAGE
} from './ItemListKeyRegistry'


export const INIT_PAGE = 'INIT_PAGE'
export const SET_PAGE_TOOLBARS = 'SET_PAGE_TOOLBARS'
export const UPDATE_PAGE_SIDEBAR = 'UPDATE_PAGE_SIDEBAR'
export const UPDATE_PAGE_SETTINGS = 'UPDATE_PAGE_SETTINGS'
export const UPDATE_PAGE_SELECTION = 'UPDATE_PAGE_SELECTION'
export const SET_PAGE_FLAG = 'SET_PAGE_FLAG'
export const WIDE_COLUMN_MODE = 'WIDE_COLUMN_MODE'

export function initList(page_key) {
    return {
	      type: INIT_PAGE,
	      page_key: page_key
    }
}

export function show_sidebar(page_key, sidebar_name) {
    return {
	      type: UPDATE_PAGE_SIDEBAR,
	      page_key: page_key,
        sidebar_name: sidebar_name,
        show_sidebar: true
    }
}

export function hide_sidebar(page_key, sidebar_name) {
    return {
	      type: UPDATE_PAGE_SIDEBAR,
	      page_key: page_key,
        sidebar_name: sidebar_name,
        show_sidebar: false
    }
}

export function set_toolbars(page_key, toolbar_names) {

    return {
	      type: SET_PAGE_TOOLBARS,
	      page_key: page_key,
        toolbar_names: toolbar_names
    }
}

export function select_issues(page_key, issue_ids) {
    return {
        type: UPDATE_PAGE_SELECTION,
	page_key: page_key,
        issue_ids: issue_ids,
    }
}

export function select_sprints(page_key, sprint_ids) {
    return {
        type: UPDATE_PAGE_SELECTION,
	page_key: page_key,
        sprint_ids: sprint_ids
    }
}

export function select_projects(page_key, project_ids) {
    return {
        type: UPDATE_PAGE_SELECTION,
	page_key: page_key,
        project_ids: project_ids
    }
}

export function select_users(page_key, user_ids) {
    return {
        type: UPDATE_PAGE_SELECTION,
	      page_key: page_key,
        user_ids: user_ids
    }
}

export function select_wikis(page_key, wiki_ids) {
    return {
        type: UPDATE_PAGE_SELECTION,
	page_key: page_key,
        wiki_ids: wiki_ids
    }
}

export function get_wide_column_mode(state, page_key) {
    return (state.page[page_key] || {}).wide_column_mode
}

export function get_header_list(state, page_key) {
    return (state.page[page_key] || {}).header_list || [];
}

export function set_wide_column_mode(page_key, wide_column_mode) {

    // temp hack, will be genericised later.
    var HEADER_LIST_WIDE = ISSUE_HEADER_LIST_WIDE
    var HEADER_LIST_NARROW = ISSUE_HEADER_LIST_NARROW
    
    var header_list;
    if ( wide_column_mode ) {
        header_list = HEADER_LIST_WIDE
        
    } else {
        header_list = HEADER_LIST_NARROW
    }
    
    return {
        type: WIDE_COLUMN_MODE,
        page_key: page_key,
        wide_column_mode: wide_column_mode,
        header_list: header_list
    }
}

export function get_selected_project_ids(state, page_key) {
    return (((state ||{}).page || {})[page_key] || {}).project_ids || []
}

export function get_selected_sprint_ids(state, page_key) {
    return (((state ||{}).page || {})[page_key] || {}).sprint_ids || []
}

export function get_selected_issue_ids(state, page_key) {
    return (((state ||{}).page || {})[page_key] || {}).issue_ids || []
}

export function get_selected_user_ids(state, page_key) {
    return (((state ||{}).page || {})[page_key] || {}).user_ids || []
}

export function get_selected_wiki_ids(state, page_key) {
    return (((state ||{}).page || {})[page_key] || {}).wiki_ids || []
}

export function setPageFlag(page_key, flag_name, value) {
    if ( value === undefined ) {
        value = true
    }
    return {
        type: SET_PAGE_FLAG,
        page_key: page_key,
        flag_name: "flag_" + flag_name,
        flag_value: value
    }
}

export function clearPageFlag(page_key, flag_name) {
    return {
        type: SET_PAGE_FLAG,
        page_key: page_key,
        flag_name: "flag_" + flag_name,
        flag_value: false
    }
}

export function getPageFlag(state, page_key, flag_name, default_value) {
    let v = (((state || {}).page || {})[page_key] || {})["flag_"+flag_name]
    if ( v === undefined ) {
        v = default_value
    }
    return v
}

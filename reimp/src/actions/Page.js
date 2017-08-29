export const INIT_PAGE = 'INIT_PAGE'
export const SET_PAGE_TOOLBARS = 'SET_PAGE_TOOLBARS'
export const UPDATE_PAGE_SIDEBAR = 'UPDATE_PAGE_SIDEBAR'
export const UPDATE_PAGE_SETTINGS = 'UPDATE_PAGE_SETTINGS'
export const UPDATE_PAGE_SELECTION = 'UPDATE_PAGE_SELECTION'
export const SET_PAGE_FLAG = 'SET_PAGE_FLAG'
export const FILTER_ISSUE_LIST_COLUMNS = 'FILTER_ISSUE_LIST_COLUMNS'

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

export function filter_issue_list_colums(page_key, filter_columns) {
    return {
        type: FILTER_ISSUE_LIST_COLUMNS,
        page_key: page_key,
        filter_columns: filter_columns
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

export function setPageFlag(page_key, flag_name) {
    return {
        type: SET_PAGE_FLAG,
        page_key: page_key,
        flag_name: "flag_" + flag_name,
        flag_value: true
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

export function getPageFlag(state, page_key, flag_name) {
    return (((state || {}).page || {})[page_key] || {})["flag_"+flag_name] || false
}

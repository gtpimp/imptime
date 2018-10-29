import { get } from 'lodash'

export const INIT_PAGE = 'INIT_PAGE'
export const SET_PAGE_TOOLBARS = 'SET_PAGE_TOOLBARS'
export const UPDATE_PAGE_SIDEBAR = 'UPDATE_PAGE_SIDEBAR'
export const UPDATE_PAGE_SETTINGS = 'UPDATE_PAGE_SETTINGS'
export const UPDATE_PAGE_SELECTION = 'UPDATE_PAGE_SELECTION'
export const SET_PAGE_FLAG = 'SET_PAGE_FLAG'
export const UPDATE_HEADER_LIST = 'UPDATE_HEADER_LIST'

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

export function set_toolbars(page_key, toolbar_names, page_name="", params=null) {

    return {
        type: SET_PAGE_TOOLBARS,
        page_key,
        toolbar_names,
        page_name,
        params
    }
}

export function getToolbarNames(state) {
    return get(state, ["page", "toolbar_names"], [])
}

export function getToolbarParams(state) {
    return get(state, ["page", "params"], [])
}

export function select_issues(page_key, issue_ids) {
    return (dispatch, getState) => {
        dispatch({
            type: UPDATE_PAGE_SELECTION,
            page_key: page_key,
            issue_ids: issue_ids,
        })
    }
}

export function select_sprints(page_key, sprint_ids) {
    return (dispatch, getState) => {
        dispatch({
            type: UPDATE_PAGE_SELECTION,
            page_key: page_key,
            sprint_ids: sprint_ids
        })
    }
}

export function select_projects(page_key, project_ids) {
    return (dispatch, getState) => {
        dispatch({
            type: UPDATE_PAGE_SELECTION,
            page_key: page_key,
            project_ids: project_ids
        })
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

export function select_features(page_key, feature_ids) {
    return {
        type: UPDATE_PAGE_SELECTION,
        page_key: page_key,
        feature_ids: feature_ids
    }
}

export function select_decision_journals(page_key, decision_journal_ids) {
    return {
        type: UPDATE_PAGE_SELECTION,
        page_key: page_key,
        decision_journal_ids: decision_journal_ids
    }
}

export function select_companies(page_key, company_ids) {
    return (dispatch, getState) => {
        dispatch({
            type: UPDATE_PAGE_SELECTION,
            page_key: page_key,
            company_ids: company_ids
        })
    }
}

export function get_header_list(state, page_key) {
    return (state.page[page_key] || {}).header_list || [];
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

export function get_selected_feature_ids(state, page_key) {
    return (((state ||{}).page || {})[page_key] || {}).feature_ids || []
}

export function get_selected_decision_journal_ids(state, page_key) {
    return (((state ||{}).page || {})[page_key] || {}).decision_journal_ids || []
}

export function get_selected_company_ids(state, page_key) {
    return (((state ||{}).page || {})[page_key] || {}).company_ids || []
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

export function setGloballySelectedIssueId(project_id, sprint_id, issue_id) {
    return setGloballySelectedEntityIds({project_id: project_id, sprint_id: sprint_id, issue_id: issue_id})
}

export function setGloballySelectedSprintId(project_id, sprint_id) {
    return setGloballySelectedEntityIds({project_id: project_id, sprint_id: sprint_id})
}

export function setGloballySelectedProjectId(project_id) {
    return setGloballySelectedEntityIds({project_id: project_id})
}

export function getGloballySelectedProjectId(state) {
    return getGloballySelectedEntityIds(state).project_id
}

export function setGloballySelectedEntityIds(entity_ids) {
    return setGlobalPageFlag("_selected_entity_ids_", entity_ids)
}

export function getGloballySelectedEntityIds(state) {
    return getGlobalPageFlag(state, "_selected_entity_ids_", null)
}

export function setGlobalPageFlag(flag_name, value) {
    return setPageFlag("__GLOBAL_PAGE__", flag_name, value)
}

export function getGlobalPageFlag(state, flag_name, default_value) {
    return getPageFlag(state, "__GLOBAL_PAGE__", flag_name, default_value)
}

export function updateHeaderList(new_header_list, page_key) {

    var header_list = new_header_list
    return {
        type: UPDATE_HEADER_LIST,
        page_key: page_key,
        header_list: header_list
    }
}

export function setBrowserTitle(title) {
    if ( title ) {
        document.title = title
    } else {
        document.title = "ImpTime"
    }
    
}

export function getPageName(state) {
    return state.page.page_name
}

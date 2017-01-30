import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import union from 'lodash/union'
import map from 'lodash/map'

export const INIT_PAGE = 'INIT_PAGE'
export const SET_PAGE_TOOLBARS = 'SET_PAGE_TOOLBARS'
export const UPDATE_PAGE_SIDEBAR = 'UPDATE_PAGE_SIDEBAR'
export const UPDATE_PAGE_SETTINGS = 'UPDATE_PAGE_SETTINGS'
export const UPDATE_PAGE_SELECTION = 'UPDATE_PAGE_SELECTION'

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

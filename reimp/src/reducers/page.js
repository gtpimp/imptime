import {
    INIT_PAGE,
    SET_PAGE_TOOLBARS,
    UPDATE_PAGE_SIDEBAR,
    UPDATE_PAGE_SETTINGS,
    UPDATE_PAGE_SELECTION,
    SET_PAGE_FLAG,
    UPDATE_HEADER_LIST,
    SET_LAST_SELECTED_SPRINT
} from '../actions/Page.js'

const initialState = {}

const page_template = {
    // Don't put any objects in here, only primitives
    toolbars: null,
    settings: null,
    selection: null,
    sidebars: null,
    header_list: null
}

export default function page(state = initialState, action) {

    let state_copy
    let l

    switch (action.type) {
        case INIT_PAGE:
            state_copy = Object.assign({}, state)
            l = Object.assign({}, page_template, state_copy[action.page_key] || {})
            state_copy[action.page_key] = Object.assign({}, l)
            return state_copy

        case UPDATE_PAGE_SETTINGS:
            state_copy = Object.assign({}, state)
            l = Object.assign({}, page_template, state_copy[action.page_key] || {})
            state_copy[action.page_key] = Object.assign({}, l, action.settings)
            return state_copy
        case SET_PAGE_TOOLBARS:
            state_copy = Object.assign({}, state)
            l = Object.assign({}, page_template, state_copy[action.page_key] || {})
            state_copy[action.page_key] = Object.assign({}, l, {
                toolbar_names: action.toolbar_names
            })
            state_copy.toolbar_names = action.toolbar_names // use the last toolbar list as the global setting
            state_copy.page_name = action.page_name
            state_copy.params = action.params
            return state_copy
        case UPDATE_PAGE_SIDEBAR:
            state_copy = Object.assign({}, state)
            l = Object.assign({}, page_template, state_copy[action.page_key] || {})
            const sidebars = Object.assign({}, l.sidebars|{})
            const sidebar = sidebars[action.sidebar_name] || {}
            sidebar.show_sidebar = action.show_sidebar
            sidebars[action.sidebar_name] = sidebar
            state_copy[action.page_key] = Object.assign({}, l, {sidebars: sidebars})
            return state_copy
        case UPDATE_PAGE_SELECTION:
            state_copy = Object.assign({}, state)
            l = Object.assign({}, page_template, state_copy[action.page_key] || {})
            state_copy[action.page_key] = Object.assign({}, l, {
                sprint_ids: action.sprint_ids || l.sprint_ids || null,
                project_ids: action.project_ids || l.project_ids || null,
                issue_ids: action.issue_ids || l.issue_ids || null,
                wiki_ids: action.wiki_ids || l.wiki_ids || null,
                feature_ids: action.feature_ids || l.feature_ids || null,
                decision_journal_ids: action.decision_journal_ids || l.decision_journal_ids || null,
                company_ids: action.company_ids || l.company_ids || null
            })
            
            return state_copy;

        case SET_PAGE_FLAG:
            state_copy = Object.assign({}, state)
            l = Object.assign({}, page_template, state_copy[action.page_key] || {})
            const flag_d = {}
            flag_d[action.flag_name] = action.flag_value
            state_copy[action.page_key] = Object.assign({}, l, flag_d)
            return state_copy

        case UPDATE_HEADER_LIST:
            state_copy = Object.assign({}, state)
            l = Object.assign({}, page_template, state_copy[action.page_key] || {})
            state_copy[action.page_key] = Object.assign({}, l,
                                                        {"header_list": action.header_list})
            return state_copy
            
        default:
            return state
    }
}

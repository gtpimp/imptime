import {
    INIT_PAGE,
    SET_PAGE_TOOLBARS,
    UPDATE_PAGE_SIDEBAR,
    UPDATE_PAGE_SETTINGS,
    UPDATE_PAGE_SELECTION
} from '../actions/Page.js'

const initialState = {}

const page_template = {
    // Don't put any objects in here, only primitives
    toolbars: null,
    settings: null,
    selection: null,
    sidebars: null
}

export default function page(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let l = Object.assign({}, page_template, state_copy[action.page_key] || {})
    
    switch (action.type) {
        case INIT_PAGE:
	    state_copy[action.page_key] = Object.assign({}, l)
	    return state_copy
	
        case UPDATE_PAGE_SETTINGS:
	    state_copy[action.page_key] = Object.assign({}, l, action.settings)
	    return state_copy
        case SET_PAGE_TOOLBARS:
	    state_copy[action.page_key] = Object.assign({}, l, {
                toolbar_names: action.toolbar_names
	    })
            state_copy.toolbar_names = action.toolbar_names // use the last toolbar list as the global setting
	    return state_copy
	case UPDATE_PAGE_SIDEBAR:
            const sidebars = Object.assign({}, l.sidebars|{})
            const sidebar = sidebars[action.sidebar_name] || {}
            sidebar.show_sidebar = action.show_sidebar
            sidebars[action.sidebar_name] = sidebar
	    state_copy[action.page_key] = Object.assign({}, l, {sidebars: sidebars})
	    return state_copy
        case UPDATE_PAGE_SELECTION:
	    state_copy[action.page_key] = Object.assign({}, l, {
                sprint_ids: action.sprint_ids || l.sprint_ids || null,
                project_ids: action.project_ids || l.project_ids || null,
                issue_ids: action.issue_ids || l.issue_ids || null
	    })
            return state_copy;
        default:
            return state
    }
}


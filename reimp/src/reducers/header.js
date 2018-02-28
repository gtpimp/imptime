import { COLLAPSE_USER_DASHBOARD, EXPAND_USER_DASHBOARD } from '../actions/Header'

const initialState = {
    user_dashboard_expanded: false
}

export default function header(state = initialState, action) {

    switch (action.type) {
        case COLLAPSE_USER_DASHBOARD:
            return Object.assign({}, state,
                action.new_settings,
                {user_dashboard_expanded: false})
        case EXPAND_USER_DASHBOARD:
            return Object.assign({}, state,
                action.new_settings,
                {user_dashboard_expanded: true})
        default:
            return state
    }

}

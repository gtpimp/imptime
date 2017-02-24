
import {
    SET_BREADCRUMBS,
    SET_BREADCRUMBS_ACTIVE
} from '../actions/Breadcrumbs'

const initialState = []


export default function breadcrumbs(state = initialState, action) {

    switch (action.type) {
        case SET_BREADCRUMBS:
            return Object.assign({}, state, {breadcrumbs: action.breadcrumbs,
                                             is_active: action.is_active})
        case SET_BREADCRUMBS_ACTIVE:
            return Object.assign({}, state, {is_active: action.is_active})
        default:
            return state
    }

}

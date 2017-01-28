
import { SET_BREADCRUMBS } from '../actions/Breadcrumbs'

const initialState = []


export default function breadcrumbs(state = initialState, action) {

    switch (action.type) {
        case SET_BREADCRUMBS:
            return action.breadcrumbs
        default:
            return state
    }

}

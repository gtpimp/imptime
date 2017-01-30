
import { TOOLBAR_SET_ACTIONS } from '../actions/Toolbar'

const initialState = {
    actions: []
}


export default function toolbar(state = initialState, action) {

    switch (action.type) {
        case TOOLBAR_SET_ACTIONS:
            return Object.assign({}, state,
                {actions: action.actions})
        default:
            return state
    }

}

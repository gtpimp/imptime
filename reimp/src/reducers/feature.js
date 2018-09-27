import {
    ANNOUNCE_BULK_CREATING_FEATURES,
    ANNOUNCE_BULK_CREATED_FEATURES,
} from '../actions/Features.js'

const initialState = {
}

export default function feature(state = initialState, action) {

    switch (action.type) {
        case ANNOUNCE_BULK_CREATING_FEATURES:
            return Object.assign({}, state,
                                 {bulk_creating_features: { sprint_id: action.sprint_id }})
            
        case ANNOUNCE_BULK_CREATED_FEATURES:
            return Object.assign({}, state,
                                 {bulk_creating_features: null})
            
        default:
            return state
    }
}

 

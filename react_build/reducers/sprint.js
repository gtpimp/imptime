import map from 'lodash/map'
import merge from 'lodash/merge'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_SPRINT_LOAD_FAILED,
    ANNOUNCE_SPRINT_LOADED,
    ANNOUNCE_LOADING_SPRINT,
    INVALIDATE_SPRINT
} from '../actions/Sprint.js'

const initialState = {
    isFetching: false,
    didInvalidate: true,
    sprints_by_id: []
}

export default function sprints(state = initialState, action) {
    switch (action.type) {
        case INVALIDATE_SPRINT:
            var x = Object.assign({}, state, {
				      sprints_by_id: Object.assign({},
								  state.sprints_by_id)
				  })
            x.sprints_by_id[action.sprint_id] = null
            return x

            return Object.assign({}, state, {
	        sprints_by_id: Object.assign({}, state.sprints_by_id, action.sprints_by_id),
                didInvalidate: true
            })
        case ANNOUNCE_LOADING_SPRINT:
            return Object.assign({}, state, {
                isFetching: true,
                didInvalidate: false
            })
        case ANNOUNCE_SPRINT_LOADED:
            var x = Object.assign({}, state,
				  {
				      sprints_by_id: Object.assign({},
								  state.sprints_by_id)
				  })
            x.sprints_by_id[action.sprint.id] = Object.assign({}, x.sprints_by_id[action.sprint.id], action.sprint);
            return x
        case ANNOUNCE_SPRINT_LOAD_FAILED:
            setErrorMessage("Failed to load sprint: " + action.error_message)
            return state;
        default:
            return state
    }
}




import {
    ASYNC_REFRESH_NOTIFICATION
} from '../actions/Async'

import { invalidateProjects } from '../actions/Projects'
import { invalidateSprints } from '../actions/Sprints'
import { invalidateIssues } from '../actions/Issues'

function triggerInvalidate(payload, dispatch) {
    if ( payload.entity_name == 'project' ) {
        dispatch(invalidateProjects([payload.entity_ref]))
	
    } else if ( payload.entity_name == 'sprint' ) {
        dispatch(invalidateSprints([payload.entity_ref]))
	
    } else if ( payload.entity_name == 'issue' ) {
        dispatch(invalidateIssues([payload.entity_ref]))
	
    } else {
        console.log("Unknown entity to refresh: " + payload.entity_name)
    }
}


function refreshMiddleware(_ref) {

    var dispatch = _ref.dispatch;
    var getState = _ref.getState;
    
    return function (next) {
        return function (action) {
            
            const state = getState()
            if (action && action.type == ASYNC_REFRESH_NOTIFICATION) {

                const payload = action.payload || [{}]
                payload.map((d) => {
                    triggerInvalidate(d, dispatch)
                })
            }
            return next(action)
        }
    }
}

module.exports = refreshMiddleware

import { impfetch } from './lib.js'

export const ANNOUNCE_SPRINT_LOADED = 'ANNOUNCE_SPRINT_LOADED'
export const ANNOUNCE_SPRINT_LOAD_FAILED = 'ANNOUNCE_SPRINT_LOAD_FAILED'
export const ANNOUNCE_LOADING_SPRINT = 'ANNOUNCE_LOADING_SPRINT'
export const INVALIDATE_SPRINT = 'INVALIDATE_SPRINT'

export function invalidateSprint(sprint_id) {
    return {
        type: INVALIDATE_SPRINT,
        sprint_id: sprint_id
    }
}

function announceLoadingSprint() {
    return {
        type: ANNOUNCE_LOADING_SPRINT
    }
}

function announceSprintLoaded(sprint) {
    return {
        type: ANNOUNCE_SPRINT_LOADED,
        sprint: sprint,
        receivedAt: Date.now()
    }
}

function announceSprintLoadFailed(error_message) {
    return {
        type: ANNOUNCE_SPRINT_LOAD_FAILED,
        error_message: error_message,
        receivedAt: Date.now()
    }
}

function fetchSprint(sprint_id) {
    return dispatch => {
        dispatch(announceLoadingSprint)
        return impfetch('sprint/'+sprint_id)
            .then(response => response.json())
            .then(json => {
                if (json.status != 'success') {
                    dispatch(announceSprintLoadFailed(json.error_message))
                } else {
                    dispatch(announceSprintLoaded(json.payload))
                }
            }).catch(function (error) {
                dispatch(announceSprintLoadFailed("Failed to load sprint: " + error.message))
            })
    }
}

function shouldFetchSprint(state, sprint_id) {
    const sprint = state.sprints.sprints_by_id[sprint_id]
    if (!sprint) {
        return true
    } else if (sprint.isFetching) {
        return false
    } else {
        return sprint.didInvalidate
    }
}

export function fetchSprintIfNeeded(sprint_id) {
    return (dispatch, getState) => {
        const state = getState()
        if (shouldFetchSprint(state, sprint_id)) {
            return dispatch(fetchSprint(sprint_id))
        }
    }
}

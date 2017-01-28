export const UPDATE_GLOBAL_FILTER = 'UPDATE_GLOBAL_FILTER'

export function updateGlobalFilter(new_filter_value) {
    return (dispatch, getState) => {
	dispatch({
	    type: UPDATE_GLOBAL_FILTER,
	    value: new_filter_value
	})

	
    }
}

export function clearGlobalFilter() {
    return updateGlobalFilter(null)
}

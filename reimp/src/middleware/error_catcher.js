import { setErrorMessage } from '../actions/Error'
import { duplicateLoading } from '../actions/Loading'

import {
    DUPLICATE_LOADING_ERROR_MESSAGE,
    DUPLICATE_SAVING_ERROR_MESSAGE
} from '../actions/lib'
const ACTIONS_TO_IGNORE = []

function error_catcher_middleware(_ref) {
    var dispatch = _ref.dispatch;

    return function (next) {
	return function (action) {

	    if ( action && action.type.indexOf('FAILED') !== -1 && ACTIONS_TO_IGNORE.indexOf(action.type) === -1 ) {

                if ( action.error && action.error.indexOf && action.error.indexOf(DUPLICATE_LOADING_ERROR_MESSAGE) !== -1 ) {
                    console.log("Duplicate call running, not an error but component will wait for initialisation: " + action.type)
                    dispatch(duplicateLoading())
                    
                } else if ( action.error && action.error.indexOf && action.error.indexOf(DUPLICATE_SAVING_ERROR_MESSAGE) !== -1 ) {
                    console.log("Duplicate during saving: " + action.error)
		    dispatch(setErrorMessage("Save conflict error: " + action.error))
                    
                } else {
		    console.log(action.error)
		    dispatch(setErrorMessage("Error: " + action.error))
                }
            }
            return next(action)
	};
    };
}

module.exports = error_catcher_middleware


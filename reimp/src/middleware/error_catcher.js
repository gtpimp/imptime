import { setErrorMessage } from '../actions/Error.js'

const ACTIONS_TO_IGNORE = []

function error_catcher_middleware(_ref) {
    var dispatch = _ref.dispatch;
    var getState = _ref.getState;

    return function (next) {
	return function (action) {

	    if ( action && action.type.indexOf('FAILED') !== -1 && ACTIONS_TO_IGNORE.indexOf(action.type) === -1 ) {
		console.log(action.error)
		dispatch(setErrorMessage("Error: " + action.error))
            }
            return next(action)
	};
    };
}

module.exports = error_catcher_middleware


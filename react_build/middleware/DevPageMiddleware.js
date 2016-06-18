import { setErrorMessage } from '../actions/Error.js'
import indexOf from 'lodash/indexOf'
import { UPDATE_LIST_SELECTION } from '../actions/ItemList'
import { invalidateList, update_list_filter } from '../actions/ItemList'
import { fetchSprintsIfNeeded } from '../actions/Sprints'

const sprints_list_key = 'sprints'
const projects_list_key = 'projects'

function DevPageMiddleware(_ref) {
    var dispatch = _ref.dispatch;
    var getState = _ref.getState;

    return function (next) {
	return function (action) {

	    switch (action.type) {
		case UPDATE_LIST_SELECTION:
		    if (action.list_key == projects_list_key) {
			dispatch(update_list_filter(sprints_list_key, {project_id:action.selected_ids[0]}))
			dispatch(invalidateList(sprints_list_key))
			dispatch(fetchSprintsIfNeeded(sprints_list_key))
		    }
	    }
	    return next(action)
	};
    };
}

module.exports = DevPageMiddleware


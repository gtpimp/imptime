
case ANNOUNCE_CREATING_ISSUE:
return Object.assign({}, state, {

    loading_item_ids: Object.assign({},
				    difference(state.loading_item_ids || [],
					       keys(action.items_by_id))),
    items_by_id: Object.assign({},
			       assign(state.items_by_id, action.items_by_id))
})


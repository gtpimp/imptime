
import { CLEAR_LOADING, CLEAR_SAVING } from '../actions/Loading'

const initialState = {
    is_loading: false,
    is_saving: false,
    loading_action_key: null,
    saving_action_key: null,
    loading_count: 0,
    saving_count: 0
    
}

export default function loading(state = initialState, action) {

    let saving_count
    let loading_count

    if ( action.type == 'CLEAR_LOADING' ) {
        return Object.assign({}, state,
                             {is_loading: false,
                              loading_count: 0}) 
    } else if ( action.type == 'CLEAR_SAVING' ) {
        return Object.assign({}, state,
                             {is_saving: false,
                              saving_count: 0})
    } else if ( action.type.indexOf("_SAVING") > -1 ) {
        saving_count = state.saving_count + 1
        return Object.assign({}, state,
                             {is_saving: saving_count>0,
                              saving_count: saving_count,
                              saving_action_key: action.type})
    } else if ( action.type.indexOf("_SAVED") > -1 ) {
        saving_count = state.saving_count - 1
        if ( saving_count < 0 ) {
            saving_count = 0
        }
        return Object.assign({}, state,
                             {is_saving: saving_count>0,
                              saving_count: saving_count,
                              saving_action_key: action.type})
    } else if ( action.type.indexOf("_SAVE_FAILED") > -1 ) {
        saving_count = state.saving_count - 1
        if ( saving_count < 0 ) {
            saving_count = 0
        }
        return Object.assign({}, state,
                             {is_saving: saving_count>0,
                              saving_count: saving_count,
                              saving_action_key: action.type})
    } else if ( action.type.indexOf("_LOADING") > -1 ) {
        loading_count = state.loading_count + 1
        return Object.assign({}, state,
                             {is_loading: loading_count>0,
                              loading_count: loading_count,
                              loading_action_key: action.type})
    } else if ( action.type.indexOf("_LOADED") > -1 ) {
        loading_count = state.loading_count - 1
        if ( loading_count < 0 ) {
            loading_count = 0
        }
        return Object.assign({}, state,
                             {is_loading: loading_count>0,
                              loading_count: loading_count,
                              loading_action_key: action.type}) 
    } else if ( action.type.indexOf("_SAVE_LOADED") > -1 ) {
        loading_count = state.loading_count - 1
        if ( loading_count < 0 ) {
            loading_count = 0
        }
        return Object.assign({}, state,
                             {is_loading: loading_count>0,
                              loading_count: loading_count,
                              loading_action_key: action.type}) 
    } else {
        return state
    }

}


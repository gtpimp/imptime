import moment from 'moment'
import { get } from 'lodash'
import { OPTION_REMEMBERER_OPTION_SELECTED } from '../actions/OptionRemember'

const initialState = {
}

function cloneRemembererState(state, action) {
    return Object.assign({}, state[action.rememberer_key] || {})
}

function setRemembererState(state, action, option_state) {
    const s = Object.assign({}, state || {})
    s[action.rememberer_key] = option_state
    return s
}

export default function option_rememberer(state = initialState, action) {

    let s = null

    if ( action.type === OPTION_REMEMBERER_OPTION_SELECTED ) {
        s = cloneRemembererState(state, action)
        const rememberer_option = Object.assign({}, s[action.option] || {})
        rememberer_option.option = action.option
        rememberer_option.most_recent = moment()
        rememberer_option.count = get(rememberer_option, ['count'], 0) + 1
        s[action.option] = rememberer_option
        return setRemembererState(state, action, s)
        
    } else {
        return state
    }

}


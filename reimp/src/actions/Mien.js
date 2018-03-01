import cookie from 'react-cookie';
import { get } from 'lodash'
import { updateHeaderList } from './Page'
import { MIEN_LIST } from './ItemListKeyRegistry'

export const SET_MIEN_BUTTON = 'SET_MIEN_BUTTON'
export const SET_MIEN = 'SET_MIEN'


const MIEN_FEATURES = { 'spec_mien': { 'multiple_issue_summary': true } }


export function getMien(state) {
    if ( cookie.load("current_mien") ) {
        return cookie.load("current_mien")
    } else {
        return get(state.settings, "mien", "dev_mien")
    }
}

export function setMien(mien) {

    cookie.save("current_mien", mien, {path: "/"})
    return {
        type: SET_MIEN,
        mien: mien
    }
}

export function updateMien(mien, page_key) {
    const new_header_list = MIEN_LIST[mien]
    return updateHeaderList(new_header_list, page_key)
}

export function doesMienHaveFeature(state, feature_name) {
    const mien = getMien(state)
    return (MIEN_FEATURES[mien] || {})[feature_name] || false
}

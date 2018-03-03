import cookie from 'react-cookie';
import { get } from 'lodash'
import { updateHeaderList } from './Page'

export const SET_MIEN_BUTTON = 'SET_MIEN_BUTTON'
export const SET_MIEN = 'SET_MIEN'

import { medium_col_width, small_col_width, tiny_col_width } from './ItemListKeyRegistry'


const MIEN_FEATURES = { 'spec_mien': { 'multiple_issue_summary': true } }

export var ISSUE_HEADERS_BY_MIEN = { 'dev': {'number': {label:"#", width:tiny_col_width},
                                             'adhoc': {label:'', width:tiny_col_width},
                                             'expand_feature': {label:'', width:tiny_col_width},
                                             'name': {label:"Name", width:"auto", flex:1},
                                             'assignee': {label:"Assignee", width:medium_col_width},
                                             'created_at': {label:"Created at", width:medium_col_width},
                                             'status': {label:"Status", width:medium_col_width},
                                             'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                             'my_estimate': {label:"Estimates", width:small_col_width},
                                             'small_delete': {label:"", width:tiny_col_width}},
                                     'reviewer': {'number': {label:"#", width:tiny_col_width},
                                                  'adhoc': {label:'', width:tiny_col_width},
                                                  'expand_feature': {label:'', width:tiny_col_width},
                                                  'name': {label:"Name", width:"auto", flex:1},
                                                  'assignee': {label:"Assignee", width:medium_col_width},
                                                  'created_at': {label:"Created at", width:medium_col_width},
                                                  'status': {label:"Status", width:medium_col_width},
                                                  'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                                  'small_delete': {label:"", width:tiny_col_width}},
                                     'finance': {'number': {label:"#", width:tiny_col_width},
                                                 'adhoc': {label:'', width:tiny_col_width},
                                                 'expand_feature': {label:'', width:tiny_col_width},
                                                 'name': {label:"Name", width:"auto", flex:1},
                                                 'assignee': {label:"Assignee", width:medium_col_width},
                                                 'created_at': {label:"Created at", width:medium_col_width},
                                                 'status': {label:"Status", width:medium_col_width},
                                                 'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                                 'small_delete': {label:"", width:tiny_col_width}},
                                     'client': {'number': {label:"#", width:tiny_col_width},
                                                'adhoc': {label:'', width:tiny_col_width},
                                                'expand_feature': {label:'', width:tiny_col_width},
                                                'name': {label:"Name", width:"auto", flex:1},
                                                'assignee': {label:"Assignee", width:medium_col_width},
                                                'created_at': {label:"Created at", width:medium_col_width},
                                                'status': {label:"Status", width:medium_col_width},
                                                'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                                'small_delete': {label:"", width:tiny_col_width}},
                                     'tester': {'number': {label:"#", width:tiny_col_width},
                                                'adhoc': {label:'', width:tiny_col_width},
                                                'expand_feature': {label:'', width:tiny_col_width},
                                                'name': {label:"Name", width:"auto", flex:1},
                                                'assignee': {label:"Assignee", width:medium_col_width},
                                                'created_at': {label:"Created at", width:medium_col_width},
                                                'status': {label:"Status", width:medium_col_width},
                                                'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                                'small_delete': {label:"", width:tiny_col_width}},
                                     'spec': {'number': {label:"#", width:tiny_col_width},
                                              'adhoc': {label:'', width:tiny_col_width},
                                              'expand_feature': {label:'', width:tiny_col_width},
                                              'name': {label:"Name", width:"auto", flex:1},
                                              'assignee': {label:"Assignee", width:medium_col_width},
                                              'status': {label:"Status", width:small_col_width},
                                              'estimate_columns': {label:"Estimates", width:small_col_width}}
}



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
    const new_header_list = ISSUE_HEADERS_BY_MIEN[mien]
    return updateHeaderList(new_header_list, page_key)
}

export function doesMienHaveFeature(state, feature_name) {
    const mien = getMien(state)
    return (MIEN_FEATURES[mien] || {})[feature_name] || false
}

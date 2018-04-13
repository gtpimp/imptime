import cookie from 'react-cookie';
import { get } from 'lodash'

export const SET_MIEN_BUTTON = 'SET_MIEN_BUTTON'
export const SET_MIEN = 'SET_MIEN'

import { large_col_width, medium_col_width, small_col_width, tiny_col_width } from './ItemListKeyRegistry'

export const MIENS = ['dev', 'reviewer', 'finance', 'client', 'tester', 'spec']
const MIEN_FEATURES = { 'spec':
                        {
                            'multiple_issue_summary': true,
                        },

                        'dev':
                        {
                            'emacs': true,
                        },
                        
                        'reviewer':
                        {
                            'review_schedule': true,
                            'sidebar_issue_estimates': true
                        },

                        'finance':
                        {
                            'multiple_issue_summary': true,
                            'costs': true
                        },

                        'client':
                        {
                            'deadlines': true
                        }
                        
}

export var ISSUE_HEADERS_BY_MIEN = { 'dev': {'number': {label:"#", width:tiny_col_width},
                                             'issue_type': {label:'', width:tiny_col_width},
                                             'expand_feature': {label:'', width:tiny_col_width},
                                             'name': {label:"Name", width:"auto", flex:1},
                                             'assignee': {label:"Assignee", width:medium_col_width},
                                             'created_at': {label:"Created at", width:medium_col_width},
                                             'status': {label:"Status", width:medium_col_width},
                                             'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                             'my_estimate': {label:"Estimates", width:small_col_width},
                                             'small_delete': {label:"", width:tiny_col_width}},
                                     'reviewer': {'number': {label:"#", width:tiny_col_width},
                                                  'issue_type': {label:'', width:tiny_col_width},
                                                  'expand_feature': {label:'', width:tiny_col_width},
                                                  'name': {label:"Name", width:"auto", flex:1},
                                                  'assignee': {label:"Assignee", width:medium_col_width},
                                                  'created_at': {label:"Created at", width:medium_col_width},
                                                  'status': {label:"Status", width:medium_col_width},
                                                  'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                                  'small_delete': {label:"", width:tiny_col_width}},
                                     'finance': {'number': {label:"#", width:tiny_col_width},
                                                 'issue_type': {label:'', width:tiny_col_width},
                                                 'expand_feature': {label:'', width:tiny_col_width},
                                                 'name': {label:"Name", width:"auto", flex:1},
                                                 'assignee': {label:"Assignee", width:medium_col_width},
                                                 'created_at': {label:"Created at", width:medium_col_width},
                                                 'status': {label:"Status", width:medium_col_width},
                                                 'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                                 'small_delete': {label:"", width:tiny_col_width}},
                                     'client': {'number': {label:"#", width:tiny_col_width},
                                                'issue_type': {label:'', width:tiny_col_width},
                                                'expand_feature': {label:'', width:tiny_col_width},
                                                'name': {label:"Name", width:"auto", flex:1},
                                                'assignee': {label:"Assignee", width:medium_col_width},
                                                'created_at': {label:"Created at", width:medium_col_width},
                                                'status': {label:"Status", width:medium_col_width},
                                                'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                                'small_delete': {label:"", width:tiny_col_width}},
                                     'tester': {'number': {label:"#", width:tiny_col_width},
                                                'issue_type': {label:'', width:tiny_col_width},
                                                'expand_feature': {label:'', width:tiny_col_width},
                                                'name': {label:"Name", width:"auto", flex:1},
                                                'assignee': {label:"Assignee", width:medium_col_width},
                                                'created_at': {label:"Created at", width:medium_col_width},
                                                'status': {label:"Status", width:medium_col_width},
                                                'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                                'small_delete': {label:"", width:tiny_col_width}},
                                     'spec': {'number': {label:"#", width:tiny_col_width},
                                              'issue_type': {label:'', width:tiny_col_width},
                                              'expand_feature': {label:'', width:tiny_col_width},
                                              'name': {label:"Name", width:large_col_width},
                                              'attachment': {label:"Att.", width:tiny_col_width},
                                              'assignee': {label:"Assignee", width:medium_col_width},
                                              'status': {label:"Status", width:small_col_width},
                                              'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                              'estimate_columns': {label:"Estimates", width:medium_col_width}}
}

export function getIssueHeaderListForCurrentMien(state) {
    return ISSUE_HEADERS_BY_MIEN[getMien(state)]
}


export function getMien(state) {
    if ( cookie.load("current_mien") ) {
        return cookie.load("current_mien") || "dev_mien"
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

export function doesMienHaveFeature(state, feature_name) {
    const mien = getMien(state)
    return (MIEN_FEATURES[mien] || {})[feature_name] || false
}

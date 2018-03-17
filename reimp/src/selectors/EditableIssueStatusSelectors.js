import { createSelector } from 'reselect'
import {
    ENTITY_KEY__ISSUE,
    ENTITY_KEY__TAG
} from '../actions/ItemListKeyRegistry'
import { each, union, intersection, get, compact, map,
         includes, filter, keyBy, keys, values, uniq, concat } from 'lodash'


const selGetAllIssuesById = (state, props) => {
    return get(state, ["item", ENTITY_KEY__ISSUE, "items_by_id"], null)
}

const selGetIssueIds = (state, props) => {
    return props.issue_ids
}

export const makeSelIssues = () => {
    return createSelector(
        [ selGetAllIssuesById, selGetIssueIds ],
        ( all_issues_by_id, issue_ids ) => {
            return map(issue_ids, function (issue_id) {
                return (all_issues_by_id && all_issues_by_id[issue_id]) || {
                    'id': issue_id,
                    'loaded': false
                }
            })
        }
    )
}

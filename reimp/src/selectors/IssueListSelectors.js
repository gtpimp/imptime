import { createSelector } from 'reselect'
import {
    ENTITY_KEY__ISSUE,
    ENTITY_KEY__TAG
} from '../actions/ItemListKeyRegistry'
import {
    getIssuesById,
    getSelectedItemIds,
    getAllIssues
} from '../actions/Issues'
import {
    getVisibleItemIds
} from '../actions/ItemList'
import {
    getAllItems
} from '../actions/Item'
import { getTags } from '../actions/Tags'
import { union, intersection, get, compact, map, includes, filter, keyBy, keys, values, uniq, concat } from 'lodash'


const selGetVisibleIssueIds = (state, props) => {
    return getVisibleItemIds(state, props.list_key)
}

const selGetAllIssuesById = (state, props) => {
    return getAllItems(state, ENTITY_KEY__ISSUE)
}

const selGetAllTagsById = (state, props) => {
    return getAllItems(state, ENTITY_KEY__TAG)
}

const selGetInvalidatedIssueIds = (state, props) => {
    return get(state, ["item", ENTITY_KEY__ISSUE, "invalidated_item_ids"], null)
}

const helperGetTagIdsForIssues = (issue_ids, issues_by_id) => {
    if ( ! issues_by_id || ! issue_ids ) {
        return []
    }
    let tag_ids = []
    issue_ids.map(function(issue_id) {
        tag_ids = concat(tag_ids, (issues_by_id[issue_id] || {}).tag_ids || [])
    })
    return tag_ids
}

const helperMergeFeatureAndIssueIds = (all_issues_by_id, visible_issue_ids) => {
    const feature_issue_ids = compact(map(values(all_issues_by_id), 'parent_group_id'))
    return union(visible_issue_ids, feature_issue_ids)
}

export const makeSelTagCategoryNamesForIssues = () => {
    return createSelector(
        [ selGetAllIssuesById, selGetVisibleIssueIds, selGetAllTagsById ],
        (all_issues_by_id, visible_issue_ids, all_tags_by_id) => {

            const visible_tag_ids = helperGetTagIdsForIssues(visible_issue_ids, all_issues_by_id)
            const tags = filter(all_tags_by_id, function(tag) { return includes(visible_tag_ids, tag.id) })
            return uniq(keys(keyBy(values(tags), 'category_name')))
        }
    )
}

export const makeSelTagIdsForIssues = () => {
    return createSelector(
        [ selGetAllIssuesById, selGetVisibleIssueIds, selGetAllTagsById ],
        (all_issues_by_id, visible_issue_ids, all_tags_by_id) => {
            return helperGetTagIdsForIssues(visible_issue_ids, all_issues_by_id)
        }
    )
}

export const makeSelIssueIds = () => {
    return createSelector(
        [ selGetAllIssuesById ],
        ( all_issues_by_id ) => {
            return map(all_issues_by_id, 'id')
        }
    )
}

export const makeSelIssuesById = () => {
    return createSelector(
        [ selGetAllIssuesById, selGetVisibleIssueIds ],
        ( all_issues_by_id, visible_issue_ids  ) => {
            const issues = all_issues_by_id && visible_issue_ids && compact(map(visible_issue_ids, function(issue_id, index) {
                return all_issues_by_id[issue_id] || {
                    'id': issue_id,
                    'loaded': false
                }
            }))
            return keyBy(issues, 'id')
        }
    )
}

export const makeSelInvalidatedIssueIds = () => {
    return createSelector(
        [ selGetAllIssuesById, selGetInvalidatedIssueIds, selGetVisibleIssueIds ],
        ( all_issues_by_id, invalidated_issue_ids, visible_issue_ids ) => {
            const merged_issue_ids = helperMergeFeatureAndIssueIds(all_issues_by_id, visible_issue_ids)
            return intersection(merged_issue_ids, invalidated_issue_ids)
        }
    )
}

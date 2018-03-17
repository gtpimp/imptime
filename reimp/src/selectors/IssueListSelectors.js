import { createSelector } from 'reselect'
import {
    ENTITY_KEY__ISSUE,
    ENTITY_KEY__TAG
} from '../actions/ItemListKeyRegistry'
import { each, union, intersection, get, compact, map,
         includes, filter, keyBy, keys, values, uniq, concat } from 'lodash'

const selGetVisibleIssueIds = (state, props) => {
    return get(state, ["item_list", props.list_key, "visible_item_ids"], null)
}

const selGetAllIssuesById = (state, props) => {
    return get(state, ["item", ENTITY_KEY__ISSUE, "items_by_id"], null)
}

const selGetAllTagsById = (state, props) => {
    return get(state, ["item", ENTITY_KEY__TAG, "items_by_id"], null)
}

const selGetInvalidatedIssueIds = (state, props) => {
    return get(state, ["item", ENTITY_KEY__ISSUE, "invalidated_item_ids"], null)
}

const selGetSavingIssueIds = (state, props) => {
    return get(state, ["item", ENTITY_KEY__ISSUE, "saving_item_ids"], null)
}

const selGetLoadingIssueIds = (state, props) => {
    return get(state, ["item", ENTITY_KEY__ISSUE, "loading_item_ids"], null)
}

const selGetSelectedIssueIds = (state, props) => {
    return get(state, ["item_list", props.list_key, "selected_ids"], null)
}

const selGetCandidateIssue = (state, props) => {
    return get(state, ["item", ENTITY_KEY__ISSUE, "candidate_item"], null)
}

const selGetExpandedIssueIds = (state, props) => {
    return get(state, ["item_list", props.list_key, "flag_expanded_issues"], null)
}

const helperGetTagIdsForIssues = (issues_by_id) => {
    if ( ! issues_by_id ) {
        return []
    }
    let tag_ids = []
    map(values(issues_by_id), function(issue) {
        tag_ids = concat(tag_ids, (get(issue, 'tag_ids')))
    })
    return tag_ids
}

const helperGetFilteredIssuesById = (all_issues_by_id, filter_issue_ids) => {
    if ( ! all_issues_by_id ) {
        return null
    }
    const issues = map(filter_issue_ids, (issue_id) => all_issues_by_id[issue_id])
    return keyBy(issues, 'id')
}

const helperGetVisibleIssuesById = (all_issues_by_id, visible_issue_ids) => {
    return helperGetFilteredIssuesById(all_issues_by_id, visible_issue_ids)
}

const helperGetFeatureIssueIds = (all_issues_by_id, visible_issue_ids) => {
    const visible_issues_by_id = helperGetVisibleIssuesById(all_issues_by_id, visible_issue_ids)
    return compact(map(values(visible_issues_by_id), 'parent_group_id'))
}

const helperMergeFeatureAndIssueIds = (all_issues_by_id, visible_issue_ids) => {
    const feature_issue_ids = helperGetFeatureIssueIds(all_issues_by_id, visible_issue_ids)
    return union(visible_issue_ids, feature_issue_ids)
}

export const makeSelFeatureIssueIds = () => {
    return createSelector (
        [ selGetAllIssuesById, selGetVisibleIssueIds ],
        (all_issues_by_id, visible_issue_ids) => {
            return helperGetFeatureIssueIds(all_issues_by_id, visible_issue_ids)
        }
    )
}

export const makeSelFeatureIssuesById = () => {
    return createSelector (
        [ selGetAllIssuesById, selGetVisibleIssueIds ],
        (all_issues_by_id, visible_issue_ids) => {
            const feature_issue_ids = helperGetFeatureIssueIds(all_issues_by_id, visible_issue_ids)
            return helperGetFilteredIssuesById(all_issues_by_id, feature_issue_ids)
        }
    )
}

export const makeSelTagCategoryNamesForIssues = () => {
    return createSelector(
        [ selGetAllIssuesById, selGetVisibleIssueIds, selGetAllTagsById ],
        (all_issues_by_id, visible_issue_ids, all_tags_by_id) => {
            const visible_issues_by_id = helperGetVisibleIssuesById(all_issues_by_id, visible_issue_ids)
            const visible_tag_ids = helperGetTagIdsForIssues(visible_issues_by_id)
            const tags = filter(all_tags_by_id, function(tag) { return includes(visible_tag_ids, tag.id) })
            return uniq(keys(keyBy(values(tags), 'category_name')))
        }
    )
}

export const makeSelTagIdsForIssues = () => {
    return createSelector(
        [ selGetAllIssuesById, selGetVisibleIssueIds, selGetAllTagsById ],
        (all_issues_by_id, visible_issue_ids, all_tags_by_id) => {
            const visible_issues_by_id = helperGetVisibleIssuesById(all_issues_by_id, visible_issue_ids)
            return helperGetTagIdsForIssues(visible_issues_by_id)
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
            const issues = all_issues_by_id && visible_issue_ids && compact(map(visible_issue_ids, function(issue_id) {
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

export const makeSelSavingIssueIds = () => {
    return createSelector(
        [ selGetAllIssuesById, selGetSavingIssueIds, selGetVisibleIssueIds ],
        ( all_issues_by_id, saving_issue_ids, visible_issue_ids ) => {
            const merged_issue_ids = helperMergeFeatureAndIssueIds(all_issues_by_id, visible_issue_ids)
            return intersection(merged_issue_ids, saving_issue_ids)
        }
    )
}

export const makeSelLoadingIssueIds = () => {
    return createSelector(
        [ selGetAllIssuesById, selGetLoadingIssueIds, selGetVisibleIssueIds ],
        ( all_issues_by_id, loading_issue_ids, visible_issue_ids ) => {
            const merged_issue_ids = helperMergeFeatureAndIssueIds(all_issues_by_id, visible_issue_ids)
            return filter(values(all_issues_by_id), (issue) => { issue.loaded === false && includes(merged_issue_ids, issue.id) })
        }
    )
}

export const makeSelSelectedIssues = () => {
    return createSelector(
        [ selGetAllIssuesById, selGetSelectedIssueIds ],
        ( all_issues_by_id, selected_issue_ids ) => {
            if ( ! all_issues_by_id ) {
                return []
            }
            return map(selected_issue_ids, function (issue_id) {
                return (all_issues_by_id && all_issues_by_id[issue_id]) || {
                    'id': issue_id,
                    'loaded': false
                }
            })
        }
    )
}

export const makeSelIssues = () => {
    return createSelector(
        [ selGetAllIssuesById, selGetVisibleIssueIds ],
        ( all_issues_by_id, visible_issue_ids ) => {
            return map(visible_issue_ids, function (visible_issue_id) {
                return (all_issues_by_id && all_issues_by_id[visible_issue_id]) || {
                    'id': visible_issue_id,
                    'loaded': false
                }
            })
        }
    )
}

export const makeSelIssueObjectsToRender = () => {
    
    return createSelector(
        [ selGetAllIssuesById, selGetVisibleIssueIds, selGetCandidateIssue, selGetExpandedIssueIds ],
        ( all_issues_by_id, visible_issue_ids, candidate_issue, expanded_issue_ids ) => {

            if ( ! all_issues_by_id ) {
                return []
            }
            const is_creating_issue = candidate_issue || false
            const visible_issues_by_id = helperGetVisibleIssuesById(all_issues_by_id, visible_issue_ids)
            const issues_to_render = []
            each(visible_issue_ids, function(issue_id, index) {
                const issue = all_issues_by_id[issue_id] || {}
                if (is_creating_issue && index === 0 && !candidate_issue.issue_id_before) {
                    issues_to_render.push({ issue: null, type: "candidate", id: null })
                }

                const show_issue = !issue.parent_group_id || includes(expanded_issue_ids, issue.parent_group_id)

                if (show_issue ) {
                    issues_to_render.push( {issue:issue, type:"issue", id: issue.id} )
                }

                if (is_creating_issue && candidate_issue.issue_id_before === issue.id) {
                    issues_to_render.push( {issue:null, type:"candidate", id: null} )
                }
            })

            return issues_to_render
        }
    )
}


import { createSelector } from 'reselect'
import {
    ENTITY_KEY__ISSUE,
    ENTITY_KEY__TAG
} from '../actions/ItemListKeyRegistry'
import { getIssue } from '../actions/Issues'
import { getTags } from '../actions/Tags'
import { includes, filter, keyBy, keys, values, uniq, concat } from 'lodash'
import {
    getAllItems
} from '../actions/Item'

const selGetIssue = (state, props) => getIssue(state, props.issue_id)

const selGetAllIssuesById = (state, props) => {
    return getAllItems(state, ENTITY_KEY__ISSUE)
}

const selGetIssueTagIds = (state, props) => {
    const issue = getIssue(state, props.issue_id)
    if ( !issue ) {
        return null
    }
    return issue.tag_ids
}

const selGetAllTagsById = (state, props) => {
    return getAllItems(state, ENTITY_KEY__TAG)
}

const selGetIssueTags = (state, props) => {
    const tag_ids = selGetIssueTagIds(state, props)
    if ( ! tag_ids ) {
        return null
    }
    return getTags(state, tag_ids)
}

export const makeSelEstimatesByUserId = () => {
    return createSelector(
        [ selGetIssue ],
        (issue) => {
            if ( ! issue ) {
                return null
            }
            return keyBy(issue.all_estimates, 'user_id')
        }
    )
}

export const makeSelActualsByUserId = () => {
    return createSelector(
        [ selGetIssue ],
        (issue) => {
            if ( ! issue ) {
                return null
            }
            return keyBy(issue.all_actuals, 'user_id')
        }
    )
}

export const makeSelIssueTagsByCategoryName = () => {
    return createSelector(
        [ selGetAllIssuesById, selGetAllTagsById, selGetIssue ],
        (all_issues_by_id, all_tags_by_id, issue) => {
            if ( ! issue ) {
                return {}
            }
            const issue_tag_ids = issue.tag_ids
            const tags = filter(all_tags_by_id, function(tag) { return includes(issue_tag_ids, tag.id) })
            return uniq(keys(keyBy(values(tags), 'category_name')))
        }
    )
}


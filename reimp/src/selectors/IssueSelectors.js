import { createSelector } from 'reselect'
import { ENTITY_KEY__ISSUE } from '../actions/ItemListKeyRegistry'
import { getIssue } from '../actions/Issues'
import { getTags } from '../actions/Tags'
import { keyBy } from 'lodash'

const selGetIssue = (state, props) => getIssue(state, props.issue_id)

const selGetIssueTagIds = (state, props) => {
    const issue = getIssue(state, props.issue_id)
    if ( !issue ) {
        return null
    }
    return issue.tag_ids
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
        [ selGetIssueTags ],
        (issue_tags) => {
            return keyBy(issue_tags, 'category_name')
        }
    )
}


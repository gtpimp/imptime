import { createSelector } from 'reselect'
import { ENTITY_KEY__ISSUE } from './ItemListKeyRegistry'
import { getIssue } from './Issues'
import { keyBy } from 'lodash'

const selGetIssue = (state, props) => getIssue(state, props.issue_id)

export const makeSelEstimatesByUserId = () => {
    return createSelector(
        [ selGetIssue ],
        (issue) => {
            if ( ! issue ) {
                return {}
            }
            return keyBy(issue.all_estimates, 'user_id')
        }
    )
}


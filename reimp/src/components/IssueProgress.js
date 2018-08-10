import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import { getIssue, ensureIssuesLoaded } from '../actions/Issues'
import { makeSelActualsByUserId, makeSelEstimatesByUserId } from '../selectors/IssueSelectors'
import { logged_in_user } from '../actions/Auth'
import Progress from './Progress'
import Hours from './Hours'

class IssueProgress extends Component {

    componentDidMount() {
        const { dispatch, issue_id } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, issue_id } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    render() {
        const { issue, user_id, is_loading, optional_actual, all_actuals_by_user_id, all_estimates_by_user_id } = this.props

        const actual = optional_actual || (all_actuals_by_user_id[user_id] && all_actuals_by_user_id[user_id].hours) || null
        const estimate = (all_estimates_by_user_id[user_id] && all_estimates_by_user_id[user_id].estimate_hours) || null
        
        return (
            <div className={css`display:flex;align-items:center;height:100%;`}>
              { actual && estimate && 
                <Progress issue={issue} actual={actual} estimate={estimate} />
              }
              { actual && ! estimate &&
                <Hours hours={actual} />
              }
            </div>
        )
    }
}

const makeMapStateToProps = () => {
    const selEstimatesByUserId = makeSelEstimatesByUserId()
    const selActualsByUserId = makeSelActualsByUserId()
    const mapStateToProps = (state, props) => {
    
        const { issue_id, optional_actual, optional_user_id } = props
        const issue = getIssue(state, issue_id)
        const user_id = optional_user_id || logged_in_user().user_id

        let all_actuals_by_user_id = null
        if ( ! optional_actual ) {
            all_actuals_by_user_id = selActualsByUserId(state, props)
        }
        const all_estimates_by_user_id = selEstimatesByUserId(state, props)
        
        return {
            issue,
            user_id,
            optional_actual,
            is_loading: !issue || !issue.id,
            all_actuals_by_user_id,
            all_estimates_by_user_id,
            user_id
        }
    }
    return mapStateToProps
}


export default connect(makeMapStateToProps)(IssueProgress)


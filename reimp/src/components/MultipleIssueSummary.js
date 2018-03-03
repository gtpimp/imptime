import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import { map, keys } from 'lodash'
import {browserHistory} from 'react-router'
import {
    invalidateMultipleIssueSummary,
    ensureMultipleIssueSummaryLoaded,
    getMultipleIssueSummary
} from '../actions/MultipleIssueSummary'
import OtherUser from './OtherUser'
import Hours from './Hours'
import CurrencyValue from './CurrencyValue'
import { has_permission } from '../actions/Users'

class MultipleIssueSummary extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, issue_ids} = props
        dispatch(ensureMultipleIssueSummaryLoaded(issue_ids))
    }

    renderEstimatesByUser(summary) {
        const { show_costs } = this.props
        return (
            <table>
              <thead>
                <td>User</td>
                <td>Raw estimate</td>
                <td>Velocity estimate</td>
                {show_costs && <td>Cost</td>}
                {show_costs && <td>With commission</td>}
              </thead>
              <tbody>
                {map(keys(summary.estimates_by_user), (user_id) =>
                    <tr>
                      <td>
                        <OtherUser user_id={user_id} />
                      </td>
                      <td>
                        <Hours value={summary.estimates_by_user[user_id].raw_estimates} />
                      </td>
                      <td>
                        <Hours value={summary.estimates_by_user[user_id].velocity_estimates} />
                      </td>
                      <td>
                        <CurrencyValue value={summary.estimates_by_user[user_id].velocity_adjusted_cost} />
                      </td>
                      <td>
                        <CurrencyValue value={summary.estimates_by_user[user_id].velocity_commission_cost_estimates} />
                      </td>
                    </tr>
                )}
              </tbody>
            </table>
        )
    }

    render() {
        const {issues, issue_ids, project_id, summary} = this.props
        return (
            <div className="multiple-issue-summary">
              <PropertyStack>
                <PropertyStackComponent>
                  Issue summary
                </PropertyStackComponent>
                <PropertyStackComponent>
                  {this.renderEstimatesByUser(summary)}
                </PropertyStackComponent>
              </PropertyStack>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {issue_ids, project_id} = props
    const summary = getMultipleIssueSummary(state, issue_ids) || {}
    const show_costs = has_permission(state, project_id, 'has_view_ctc_billable_rates')
    return {
        summary: summary,
        issue_ids: issue_ids,
        show_costs
    }
}

export default connect(mapStateToProps)(MultipleIssueSummary)

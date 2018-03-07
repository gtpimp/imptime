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
import TagCategory from './TagCategory'
import { ensureTagsLoaded } from '../actions/Tags'
import { has_permission } from '../actions/Users'
import { doesMienHaveFeature } from '../actions/Mien'
import Tag from './Tag'

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
        const {dispatch, filter, summary} = props
        dispatch(ensureMultipleIssueSummaryLoaded(filter))
        dispatch(ensureTagsLoaded(summary.all_tag_ids))
    }

    renderActualsByUser(summary) {
        const { show_costs } = this.props
        return (
            <PropertyStackComponent>
              <h2>Actuals by user</h2>
              <table className="table__column_table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Hours</th>
                    <th>Naive velocity</th>
                    <th>Real velocity</th>
                    <th>Role</th>
                    {show_costs && <th>Cost</th>}
                    {show_costs && <th>Cost with commission</th>}
                  </tr>
                </thead>
                <tbody>
                  {map(keys(summary.actuals_by_user), (user_id) =>
                      <tr key={user_id}>
                        <td>
                          <OtherUser user_id={user_id} />
                        </td>
                        <td>
                          <Hours hours={summary.actuals_by_user[user_id].hours} />
                        </td>
                        <td>
                          {Math.round(summary.actuals_by_user[user_id].calculated_velocity*100)/100}
                          <div className="multiple-issue-summary__tip">
                            Naive velocity uses all issues, even if not closed. It is not as accurate as real velocity.
                          </div>
                        </td>
                        <td>
                          {Math.round(summary.velocities_by_user[user_id].closed_velocity*100)/100}
                          <div className="multiple-issue-summary__tip">
                            Real velocity ignores issues in states:
                            {map(summary.velocities_by_user[user_id].ignoring_issues_in_status, (status) =>
                                <div key={status}>{status}</div>)}
                          </div>
                        </td>
                        <td>
                          {summary.velocities_by_user[user_id].time_tracking_mode}
                        </td>
                        { show_costs && 
                          <td>
                            <CurrencyValue value={summary.actuals_by_user[user_id].cost} />
                          </td>
                        }
                        { show_costs && 
                          <td>
                            <CurrencyValue value={summary.actuals_by_user[user_id].commission_cost} />
                          </td>
                        }
                      </tr>
                   )}
                </tbody>
              </table>
            </PropertyStackComponent>
        )
    }
    
    renderEstimatesByUser(summary) {
        const { show_costs } = this.props
        return (
            <PropertyStackComponent>
              <h2>Estimates by user</h2>
              <table className="table__column_table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Raw</th>
                    <th>Given velocity</th>
                    <th>With given velocity</th>
                    {show_costs && <th>Cost</th>}
                    {show_costs && <th>Cost with commission</th>}
                  </tr>
                </thead>
                <tbody>
                  {map(keys(summary.estimates_by_user), (user_id) =>
                      <tr key={user_id}>
                        <td>
                          <OtherUser user_id={user_id} />
                        </td>
                        <td>
                          <Hours hours={summary.estimates_by_user[user_id].raw_estimates} />
                        </td>
                        <td>
                          {Math.round(summary.estimates_by_user[user_id].given_velocity*100)/100}
                        </td>
                        <td>
                          <Hours hours={summary.estimates_by_user[user_id].velocity_estimates} />
                        </td>
                        { show_costs && 
                          <td>
                            <CurrencyValue value={summary.estimates_by_user[user_id].velocity_cost} />
                          </td>
                        }
                        { show_costs && 
                          <td>
                            <CurrencyValue value={summary.estimates_by_user[user_id].velocity_commission_cost} />
                          </td>
                        }
                      </tr>
                   )}
                </tbody>
              </table>
            </PropertyStackComponent>
        )
    }

    renderEstimatesByTagCategory(summary) {
        const { show_costs } = this.props
        return (
            <div>
              { map(keys(summary.estimates_by_tag_category), function(tag_category_id) {
                    const estimates_by_user = summary.estimates_by_tag_category[tag_category_id]
                    return (
                        <PropertyStackComponent key={tag_category_id}>
                          <h2>
                            <TagCategory tag_category_id={tag_category_id}/>
                          </h2>

                          { map(keys(estimates_by_user), function(user_id) {
                                const estimates_by_user_by_tag = estimates_by_user[user_id]
                                return (
                                    <PropertyStackComponent key={user_id}>
                                      <h2>
                                        <OtherUser user_id={user_id} />
                                      </h2>
                                      <table className="table__column_table">
                                        <thead>
                                          <tr>
                                            <th>Tag</th>
                                            <th>Raw</th>
                                            <th>Given velocity</th>
                                            <th>With given velocity</th>
                                            {show_costs && <th>Cost</th>}
                                            {show_costs && <th>With commission</th>}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {map(keys(estimates_by_user_by_tag), (tag_id) =>
                                              <tr key={tag_id}>
                                                <td>
                                                  <Tag tag_id={tag_id} />
                                                </td>
                                                <td>
                                                  <Hours hours={estimates_by_user_by_tag[tag_id].raw_estimates} />
                                                </td>
                                                <td>
                                                  {Math.round(estimates_by_user_by_tag[tag_id].given_velocity*100)/100}
                                                </td>
                                                <td>
                                                  <Hours hours={estimates_by_user_by_tag[tag_id].velocity_estimates} />
                                                </td>
                                                { show_costs && 
                                                  <td>
                                                    <CurrencyValue value={estimates_by_user_by_tag[tag_id].velocity_cost} />
                                                  </td>
                                                }
                                                { show_costs && 
                                                  <td>
                                                    <CurrencyValue value={estimates_by_user_by_tag[tag_id].velocity_commission_cost} />
                                                  </td>
                                                }
                                              </tr>
                                           )}
                                        </tbody>
                                      </table>
                                    </PropertyStackComponent>
                                )
                            }
                            )}
                        </PropertyStackComponent>
                    )
                }
                )}
            </div>
        )
    }

    render() {
        const {issues, project_id, summary} = this.props
        return (
            <div className="multiple-issue-summary">
              <PropertyStack>
                <PropertyStackComponent>
                  <h1>Estimate summary</h1>
                </PropertyStackComponent>
                {this.renderActualsByUser(summary)}
                {this.renderEstimatesByUser(summary)}
                {this.renderEstimatesByTagCategory(summary)}
              </PropertyStack>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {filter, project_id} = props
    
    const summary = getMultipleIssueSummary(state, filter) || {}
    const show_costs = doesMienHaveFeature(state, 'costs') && has_permission(state, project_id, 'has_view_ctc_billable_rates')
    return {
        summary: summary,
        filter,
        show_costs
    }
}

export default connect(mapStateToProps)(MultipleIssueSummary)

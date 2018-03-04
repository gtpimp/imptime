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
        const {dispatch, issue_ids, summary} = props
        dispatch(ensureMultipleIssueSummaryLoaded(issue_ids))
        dispatch(ensureTagsLoaded(summary.all_tag_ids))
    }

    renderEstimatesByUser(summary) {
        const { show_costs } = this.props
        return (
            <PropertyStackComponent>
              <h2>Estimates by user</h2>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Raw estimate</th>
                    <th>Velocity estimate</th>
                    {show_costs && <th>Cost</th>}
                    {show_costs && <th>With commission</th>}
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
                                      <table>
                                        <thead>
                                          <tr>
                                            <th>Tag</th>
                                            <th>Raw estimate</th>
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
        const {issues, issue_ids, project_id, summary} = this.props
        return (
            <div className="multiple-issue-summary">
              <PropertyStack>
                <PropertyStackComponent>
                  Issue summary
                </PropertyStackComponent>
                {this.renderEstimatesByUser(summary)}
                {this.renderEstimatesByTagCategory(summary)}
              </PropertyStack>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {issue_ids, project_id} = props
    const summary = getMultipleIssueSummary(state, issue_ids) || {}
    const show_costs = doesMienHaveFeature(state, 'costs') && has_permission(state, project_id, 'has_view_ctc_billable_rates')
    return {
        summary: summary,
        issue_ids: issue_ids,
        show_costs
    }
}

export default connect(mapStateToProps)(MultipleIssueSummary)

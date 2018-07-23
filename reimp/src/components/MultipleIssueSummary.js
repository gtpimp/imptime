import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import { map, keys, get } from 'lodash'
import { getCostSummary, ensureCostSummaryLoaded } from '../actions/CostSummary'
import {
    ensureMultipleIssueSummaryLoaded,
    getMultipleIssueSummary,
    downloadActualsByIssue
} from '../actions/MultipleIssueSummary'
import OtherUser from './OtherUser'
import Hours from './Hours'
import CurrencyValue from './CurrencyValue'
import SprintName from './SprintName'
import IssueName from './IssueName'
import TagCategory from './TagCategory'
import { ensureTagsLoaded } from '../actions/Tags'
import { ensureIssuesLoaded } from '../actions/Issues'
import { ensureUsersLoaded } from '../actions/Users'
import Tag from './Tag'
import { showMoney } from '../actions/Mien'

class MultipleIssueSummary extends Component {

    constructor(props) {
        super(props)
        this.download_actuals_by_issue = this.download_actuals_by_issue.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, filter, sprint_id, summary} = props

        if ( ! filter && sprint_id ) {
            dispatch(ensureCostSummaryLoaded(sprint_id))
        } else {
            dispatch(ensureMultipleIssueSummaryLoaded(filter))
        }
        dispatch(ensureTagsLoaded(summary.all_tag_ids))
        dispatch(ensureIssuesLoaded(summary.all_issue_ids))
        dispatch(ensureUsersLoaded(summary.all_user_ids))
    }

    download_actuals_by_issue(event) {
        const { filter, project_id, dispatch  } = this.props
        event.preventDefault()
        dispatch(downloadActualsByIssue(filter, project_id))
    }

    createActualsForIssue(summary, issue_id) {
        const { show_money } = this.props
        const user_columns = []

        map(summary.all_user_ids, function(user_id) {
            user_columns.push(
                <td key={"hours_"+user_id}>
                  <Hours hours={get(summary, ["actuals_by_issue_and_user", issue_id, user_id, "hours"], 0)} />
                </td>
            )
            if ( show_money ) {
                user_columns.push(
                    <td key={"rate_"+user_id}>
                      <CurrencyValue value={get(summary, ["actuals_by_issue_and_user", issue_id, user_id, "rate_with_commission"], 0)} />
                    </td>
                )
                user_columns.push(
                    <td key={"cost_"+user_id}>
                      <CurrencyValue value={get(summary, ["actuals_by_issue_and_user", issue_id, user_id, "cost_with_commission"], 0)} />
                    </td>
                )
            }
        })
        return user_columns
    }

    renderActualsBySprint(summary) {
        const { show_money } = this.props

        const sprint_header_columns_row1 = []
        map(summary.all_sprint_ids, function(sprint_id) {
            sprint_header_columns_row1.push(<th key={"header_sprint_" + sprint_id}>Sprint</th>)
            sprint_header_columns_row1.push(<th key={"header_hours_" + sprint_id}>Hours</th>)
            
            if ( show_money ) {
                sprint_header_columns_row1.push(<th key={"actual_" + sprint_id}>Actual</th>)
            }
        })
        
        return (
            <PropertyStackComponent>
              <h2>
                Actuals by sprint
              </h2>
              <table className="table__column_table table__hover_row_table">
                <thead>
                  <tr>
                    { map(sprint_header_columns_row1, col => col)}
                  </tr>
                </thead>
                <tbody>
                  {map(keys(summary.actuals_by_sprint), (sprint_id) =>
                      <tr key={sprint_id}>
                        <td>
                          <SprintName sprint_id={sprint_id} />
                        </td>
                        <td>
                          <Hours hours={summary.actuals_by_sprint[sprint_id].hours}/>
                        </td>
                        { show_money && 
                          <td>
                            <CurrencyValue value={get(summary, ["actuals_by_sprint", sprint_id, "cost_with_commission"], 0)} />
                          </td>
                        }
                      </tr>
                   )}
                </tbody>
              </table>
            </PropertyStackComponent>
        )
    }

    renderActualsByIssue(summary) {
        const { show_money } = this.props
        const that = this

        const user_header_columns_row1 = []
        const user_header_columns_row2 = []
        map(summary.all_user_ids, function(user_id) {
            user_header_columns_row1.push(<th key={"header_user_" + user_id}><OtherUser user_id={user_id}/></th>)
            user_header_columns_row2.push(<th key={"header_hours_" + user_id}>Hours</th>)
            
            if ( show_money ) {
                user_header_columns_row1.push(<th key={"rate_" + user_id}></th>)
                user_header_columns_row1.push(<th key={"cost_" + user_id}></th>)
                
                user_header_columns_row2.push(<th key={"rate_" + user_id}>Rate</th>)
                user_header_columns_row2.push(<th key={"cost_" + user_id}>Cost</th>)
            }
        })
        
        return (
            <PropertyStackComponent>
              <h2>
                Actuals by issue
              </h2>
              <table className="table__column_table table__hover_row_table">
                <thead>
                  <tr>
                    <th>Issue</th>
                    { map(user_header_columns_row1, col => col)}
                    { show_money && <th>Total Issue Cost</th> }
                  </tr>
                  <tr>
                    <th></th>
                    { map(user_header_columns_row2, col => col)}
                  </tr>
                </thead>
                <tbody>
                  {map(keys(summary.actuals_by_issue_and_user), (issue_id) =>
                      <tr key={issue_id}>
                        <td>
                          <IssueName issue_id={issue_id} />
                        </td>
                        { map(that.createActualsForIssue(summary, issue_id), col => col)}
                        { show_money && 
                          <td>
                            <CurrencyValue value={get(summary, ["actuals_by_issue", issue_id, "cost_with_commission"], 0)} />
                          </td>
                        }
                      </tr>
                   )}
                </tbody>
              </table>
            </PropertyStackComponent>
        )
    }
    
    renderActualsByUser(summary) {
        const { show_money } = this.props
        summary.velocities_by_user = summary.velocities_by_user || {}
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
                    {show_money && <th>Cost</th>}
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
                          {Math.round((summary.velocities_by_user[user_id] || {}).closed_velocity*100)/100}
                          <div className="multiple-issue-summary__tip">
                            Real velocity ignores issues in states:
                            {map((summary.velocities_by_user[user_id] || {}).ignoring_issues_in_status, (status) =>
                                <div key={status}>{status}</div>)}
                          </div>
                        </td>
                        <td>
                          {(summary.velocities_by_user[user_id] ||  {}).time_tracking_mode}
                        </td>
                        { show_money && 
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
        const { show_money } = this.props
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
                    {show_money && <th>Cost with given velocity</th>}
                    <th>Calculated velocity</th>
                    <th>With calculated velocity</th>
                    {show_money && <th>Cost with calculated velocity</th>}
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
                        { show_money && 
                          <td>
                            <CurrencyValue value={summary.estimates_by_user[user_id].velocity_commission_cost} />
                          </td>
                        }

                        <td>
                          {summary.velocities_by_user[user_id] && Math.round(summary.velocities_by_user[user_id].closed_velocity*100)/100}
                        </td>
                        <td>
                          { summary.revised_estimates_by_user[user_id] && 
                            <Hours hours={summary.revised_estimates_by_user[user_id].velocity_estimates} />
                          }
                        </td>
                        { show_money && summary.revised_estimates_by_user[user_id] && 
                          <td>
                            <CurrencyValue value={summary.revised_estimates_by_user[user_id].velocity_commission_cost} />
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
        const { show_money } = this.props
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
                                            {show_money && <th>Cost</th>}
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
                                                { show_money && 
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

    renderActualsByTagCategory(summary) {
        const { show_money } = this.props
        return (
            <div>
              <h2>Actuals by tag category</h2>
              { map(keys(summary.actuals_by_tag_category), function(tag_category_id) {
                    const actuals_by_user = summary.actuals_by_tag_category[tag_category_id]
                    return (
                        <PropertyStackComponent key={tag_category_id}>
                          <h2>
                            <TagCategory tag_category_id={tag_category_id}/>
                          </h2>

                          { map(keys(actuals_by_user), function(user_id) {
                                const actuals_by_user_by_tag = actuals_by_user[user_id]
                                return (
                                    <PropertyStackComponent key={user_id}>
                                      <h3>
                                        <OtherUser user_id={user_id} />
                                      </h3>
                                      <table className="table__column_table">
                                        <thead>
                                          <tr>
                                            <th>Tag</th>
                                            <th>Hours</th>
                                            {show_money && <th>Cost</th>}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {map(keys(actuals_by_user_by_tag), (tag_id) =>
                                              <tr key={tag_id}>
                                                <td>
                                                  <Tag tag_id={tag_id} />
                                                </td>
                                                <td>
                                                  <Hours hours={actuals_by_user_by_tag[tag_id].hours} />
                                                </td>
                                                { show_money && 
                                                  <td>
                                                    <CurrencyValue value={actuals_by_user_by_tag[tag_id].cost_with_commission} />
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
        const {summary, container_class_name} = this.props
        return (
            <div className={classNames("multiple-issue-summary", container_class_name)}>
              <PropertyStack>
                <PropertyStackComponent>
                  <h1>Breakdown by user, tags and issues
                    <div className="icon--download_as_csv cost-summary__issue-breakdown__download"
                         onClick={this.download_actuals_by_issue} />
                  </h1>
                </PropertyStackComponent>
                {this.renderActualsBySprint(summary)}
                {this.renderActualsByUser(summary)}
                {this.renderActualsByTagCategory(summary)}
                {this.renderActualsByIssue(summary)}
                {this.renderEstimatesByUser(summary)}
                {this.renderEstimatesByTagCategory(summary)}
              </PropertyStack>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {filter, sprint_id, project_id, container_class_name} = props

    let summary
    
    if ( !filter && sprint_id ) {
        // It's more efficient to use the cost summary embedded in the
        // sprint cost summary if we're fetching for a single sprint,
        // because it saves an api call and caches better.
        const cost_summary = getCostSummary(state, sprint_id)
        if ( cost_summary ) {
            summary = cost_summary.breakdown
        }
    } else {
        summary = getMultipleIssueSummary(state, filter)
    }
    
    const show_money = showMoney(state, project_id)
    return {
        summary: summary || {},
        filter,
        sprint_id,
        show_money,
        container_class_name
    }
}

export default connect(mapStateToProps)(MultipleIssueSummary)

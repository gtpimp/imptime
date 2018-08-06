import React, {Component} from 'react'
import { map, keys } from 'lodash'
import OtherUser from '../OtherUser'
import CurrencyValue from '../CurrencyValue'
import Hours from '../Hours'

class EstimateSummary extends Component {

    renderComparativeSummary(comparative_estimates) {
        return (
            <table className="sprint_estimate__comparative_summary__table">
              <thead className="sprint_estimate__comparative_summary_grid_header">
                <th>User</th>
                <th>Hours (as estimated)</th>
                <th>Velocity</th>
                <th>Hours (with velocity)</th>
                <th>Developer Rate</th>
                <th>Developer Cost</th>
                <th>Tester estimates</th>
                <th>Tester rate</th>
                <th>Tester cost</th>
                <th>Manager estimates</th>
                <th>Manager rate</th>
                <th>Manager cost</th>
                <th>Working cost</th>
                <th>Ratio scope creep</th>
                <th>Total cost</th>
              </thead>
              <tbody>
                { map(keys(comparative_estimates.by_user),
                      function(user_id) {
                          const estimates = comparative_estimates.by_user[user_id]
                          return (
                              <tr key={user_id}>
                                <td><OtherUser user_id={user_id}/></td>
                                <td><Hours hours={estimates.developer_original_hours}/></td>
                                <td>{estimates.developer_velocity}</td>
                                <td><Hours hours={estimates.developer_adjusted_hours}/></td>
                                <td><CurrencyValue value={estimates.developer_rate_with_commission} prefix="@"/></td>
                                <td><CurrencyValue value={estimates.developer_cost}/></td>
                                <td><Hours hours={estimates.tester_adjusted_hours}/></td>
                                <td><CurrencyValue value={estimates.tester_rate_with_commission} prefix="@"/></td>
                                <td><CurrencyValue value={estimates.tester_cost}/></td>
                                <td><Hours hours={estimates.manager_adjusted_hours}/></td>
                                <td><CurrencyValue value={estimates.manager_rate_with_commission} prefix="@"/></td>
                                <td><CurrencyValue value={estimates.manager_cost}/></td>
                                <th><CurrencyValue value={estimates.working_cost}/></th>
                                <td>{estimates.ratio_scope_creep}</td>
                                <th><CurrencyValue value={estimates.total_cost}/></th>
                              </tr>
                          )
                      }
                )}
              </tbody>
            </table>
        )
    }

    render() {
        const {estimate_time_summary} = this.props
        if ( ! estimate_time_summary ) {
            return null
        }
        const {comparative_estimates} = estimate_time_summary
        if (! comparative_estimates ) {
            return null
        } 
        return (
            <div>
              <div className="sprint_estimate__comparative_summary"> 
                <div className="sprint_estimate__comparative_summary_grid">
                  {this.renderComparativeSummary(comparative_estimates)}
                </div>
              </div>
            </div>
        )
    }
}

export default EstimateSummary

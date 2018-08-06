import React, {Component} from 'react'
import ProgressBar from '../ProgressBar'
import {map, keys} from 'lodash'
import CurrencyValue from '../CurrencyValue'
import SprintLink from '../SprintLink'

class SprintBudgets extends Component {

    render() {
        const { project_statement } = this.props
        const { sprint_infos } = project_statement
        return (
            <table className="project__statement__table">
              <thead className="project__statement__table_header">
                <tr>
                  <th></th>
                  <th>Total budget</th>
                  <th>Remaining budget</th>
                  <th>Budget progress</th>
                  <th>Spent</th>
                  <th>Commission</th>
                </tr>
              </thead>
              <tbody>
                { map(keys(project_statement.times_by_sprint),
                      function(sprint_id) {
                          const times_for_sprint = project_statement.times_by_sprint[sprint_id]
                          return (
                              <tr key={sprint_id}>
                                <th>
                                  <SprintLink sprint_id={sprint_id}
                                              sprint_name={sprint_infos[sprint_id].sprint_name}
                                              project_id={sprint_infos[sprint_id].project_id} />
                                </th>
                                <td>
                                  <CurrencyValue value={ times_for_sprint.totals_across_time.budget }/>
                                </td>
                                <td>
                                  <CurrencyValue value={ times_for_sprint.totals_across_time.remaining_budget } />
                                </td>
                                <td className="project__statement__budgets_grid__progress_bar">
                                  <ProgressBar current={ times_for_sprint.totals_across_time.total_billable_cost }
                                               max={ times_for_sprint.totals_across_time.budget } />
                                </td>
                                <th>
                                  <CurrencyValue value={ times_for_sprint.totals_across_time.total_billable_cost } />
                                </th>
                                <td>
                                  <CurrencyValue value={ times_for_sprint.totals_across_time.commission_cost } />
                                </td>
                              </tr>
                          )
                      }
                  )
                }
              </tbody>
            </table>
        )
    }
}

export default SprintBudgets


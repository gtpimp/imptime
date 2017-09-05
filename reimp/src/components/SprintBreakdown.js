import React, { Component } from 'react'
import { connect } from 'react-redux'
import OtherUser from './OtherUser'
import { map, keys } from 'lodash'
import UserRate from './UserRate'
import Hours from './Hours'
import CurrencyValue from './CurrencyValue'
import SprintLink from './SprintLink'

class SprintBreakdown extends Component {

    render() {
        const { project_statement } = this.props
        const { sprint_infos } = project_statement
        return (
            <table className="project__statement__times_grid__table">
              <thead className="project__statement__times_grid__header">
                <tr>
                  <th>
                  </th>
                  { map(project_statement.users_with_time,
                        function(user_id) {
                            return (
                                <th key={user_id}>
                                  <OtherUser value={user_id} />
                                </th>
                            )
                        }
                    )
                  }
                </tr>

                <tr>
                  <th>
                  </th>
                  { map(project_statement.users_with_time,
                        function(user_id) {
                            return (
                                <td key={user_id}>
                                  <table width="100%">
                                    <tbody>
                                      <tr>
                                        <th className="project__statement__times_grid__inner_cell">
                                          Hours
                                        </th>
                                        <th className="project__statement__times_grid__inner_cell">
                                          Rate
                                        </th>
                                        <th className="project__statement__times_grid__inner_cell">
                                          Cost
                                        </th>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                            )
                        }
                    )
                  }
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
                                { map(project_statement.users_with_time,
                                      function(user_id) {
                                          const time_for_user = times_for_sprint.users[user_id]
                                          return (
                                              <td key={user_id}>
                                                <table width="100%">
                                                  <tbody>
                                                    <tr>
                                                      <td className="project__statement__times_grid__inner_cell">
                                                        <Hours hours={time_for_user.total_hours}/>
                                                      </td>
                                                      <td className="project__statement__times_grid__inner_cell project__statement__times_grid__rate_cell">
                                                        <UserRate value={time_for_user.rate}/>
                                                      </td>
                                                      <td className="project__statement__times_grid__inner_cell">
                                                        <CurrencyValue value={time_for_user.billable_cost}/>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                          )
                                      }
                                  )
                                }
                                              <th className="project__statement__times_grid__sprint_total">
                                                <CurrencyValue value={times_for_sprint.totals.total_billable_cost}/>
                                              </th>
                              </tr>
                          )
                      }
                  )
                }
              </tbody>
              <tfoot className="project__statement__times_grid__footer">
                <tr className="project__statement__times_grid__user_total">
                  <th>
                  </th>
                  { map(project_statement.users_with_time,
                        function(user_id) {
                            const time_for_user = project_statement.times_by_user[user_id]
                            return (
                                <th key={user_id}>
                                  <table width="100%">
                                    <tbody>
                                      <tr>
                                        <td className="project__statement__times_grid__inner_cell">
                                          <Hours hours={time_for_user.total_hours}/>
                                        </td>
                                        <td className="project__statement__times_grid__inner_cell">
                                        </td>
                                        <td className="project__statement__times_grid__inner_cell">
                                          <CurrencyValue value={time_for_user.total_billable_cost}/>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </th>
                            )
                        }
                    )
                  }
                                <th className="project__statement__times_grid__grand_total">
                                  <CurrencyValue value={project_statement.grand_totals.total_billable_cost}/>
                                </th>
                </tr>
              </tfoot>
            </table>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_statement } = props
    
    return {
        project_statement: project_statement,
    }
}

export default connect(mapStateToProps)(SprintBreakdown)

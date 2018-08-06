import React, {Component} from 'react'
import { map, get } from 'lodash'
import ProgressBar from '../ProgressBar' 
import OtherUser from '../OtherUser'
import Hours from '../Hours'
import EditableUserRate from '../EditableUserRate'
import CurrencyValue from '../CurrencyValue'

class TimeSummary extends Component {

    renderSummaryForDevelopers(developers, time_summary, sprint_id, use_live_data) {
        return (

            <table className="sprint_time_summary__table">
              <thead className="sprint_time_summary__table__header">
                <tr>
                  <th>
                    Developer
                  </th>
                  <th> 
                    Rate
                  </th>
                  <th>
                    Dev hours used
                  </th>
                  <th>
                    Dev hours remaining
                  </th>
                  <th>
                    Tester hours remaining
                  </th>
                  <th>
                    Manager hours remaining
                  </th> 
                  <th>
                    Budget progress<br/>
                    <ProgressBar current={ time_summary.budget_ratio } max={ 1.0 } />
                  </th>
                </tr>
              </thead>
              <tbody>
                {map(developers, (developer, developer_id) =>
                    <tr key={developer_id}>
                      <th>
                        <OtherUser user_id={developer_id} />
                      </th>
                      <td>
                        { use_live_data &&
                          <EditableUserRate sprint_id={sprint_id} user_id={developer_id} />
                        }
                        { ! use_live_data &&
                          <CurrencyValue value={developer.rate} />
                        }
                      </td>
                      <td>
                        <Hours hours={developer.dev_hours_used}/>
                      </td>
                      <td>
                        <Hours hours={developer.dev_hours_available}/>
                      </td>
                      <td>
                        <Hours hours={developer.tester_hours_available}/>
                      </td>
                      <td>
                        <Hours hours={developer.manager_hours_available}/>
                      </td>
                    </tr>
                )}
              </tbody>
            </table>
        )
    }

    render() {
        const { time_summary, show_heading, sprint_id, use_live_data_where_possible } = this.props
        const use_live_data = use_live_data_where_possible === undefined ? true : use_live_data_where_possible
        const per_user = get(time_summary, 'per_user', {})

        if (! time_summary ) {
            return null
        }
        
        return (
            <div>
              { per_user &&
                (
                    <div className="sprint_time_summary">
                      { show_heading &&
                        <h2 className="sprint_time_summary__header">
                          Time remaining based on budget (if each developer works on all remaining issues themselves)
                        </h2>
                      }
                        {this.renderSummaryForDevelopers(per_user, time_summary,
                                                         sprint_id, use_live_data)}
                    </div>
                )
              }
            </div>
        )
    }
}

export default TimeSummary

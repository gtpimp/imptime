import React, { Component } from 'react'
import { connect } from 'react-redux'
import '../sass/user-timesheet.scss'
import {
    getUserTimesheet,
    ensureUserTimesheetsLoaded
} from '../actions/UserTimesheets'
import OtherUser from './OtherUser'
import TimeChart from './TimeChart'

class UserTimesheet extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const { dispatch, user_id } = these_props || this.props
        if ( user_id ) {
            dispatch(ensureUserTimesheetsLoaded([user_id]))
        }
    }
    
    render() {
        const { user_timesheet, user_id } = this.props

        const is_bad = user_timesheet.average_hours_worked < user_timesheet.required_daily_work_hours_warning_threshold
        
        return (
            <div className="user_timesheet">
              { ! user_timesheet.id &&
                <div>Loading...</div>
              }
              { user_timesheet.id &&
                <div key={user_id} className="user_timesheet__chart">
                  <OtherUser user_id={user_id} />
                  { is_bad &&
                    <div className="user_timesheet__chart__warning_message"> 
                      Average is below {user_timesheet.required_daily_work_hours_warning_threshold}
                    </div>
                  }
                  <TimeChart times={user_timesheet.worked}
                             sick_days={true}
                             public_holidays={true}
                             leave_days={true}
                             office_closed={true}
                             average_hours_worked={user_timesheet.average_hours_worked}
                             average_hours_worked_warning_threshold={user_timesheet.required_daily_work_hours_warning_threshold}
                             reference_line_hours={user_timesheet.required_daily_work_hours}
                             show_y_axis={true}
                             yaxis_datakey="graph_y"
                             xaxis_datakey="started_on"
                             width={500}
                             height={150}
                  />
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { user_id } = props
    const user_timesheet = getUserTimesheet(state, user_id)
    return {
        user_id,
        user_timesheet: user_timesheet || {},
        user_timesheet_id: (user_timesheet || {}).id
    }
}

export default connect(mapStateToProps)(UserTimesheet)

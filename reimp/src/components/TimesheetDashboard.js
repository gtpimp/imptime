import React, { Component } from 'react'
import { map, size } from 'lodash'
import { DragSource, DropTarget } from 'react-dnd'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { DndTypes } from '../actions/Dnd'
import '../sass/timesheet-dashboard.css'
import {
    getTimesheetDashboard,
    ensureTimesheetDashboardLoaded
} from '../actions/TimesheetDashboards'
import { ensureUsersLoaded } from '../actions/Users'
import OtherUser from './OtherUser'
import TimeChart from './TimeChart'

class TimesheetDashboard extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const { dispatch, timesheet_dashboard } = these_props || this.props
        dispatch(ensureTimesheetDashboardLoaded())
    }
    
    render() {
        const { timesheet_dashboard } = this.props

        return (
            <div className="timesheet_dashboard">
              { ! timesheet_dashboard &&
                <div>Loading...</div>
              }
              { timesheet_dashboard &&
                <div className="timesheet_dashboard__charts">
                  { map(timesheet_dashboard.times_by_user, (times_for_user, user_id) =>
                      (
                          <div key={user_id}>
                            <OtherUser user_id={user_id} />
                            <TimeChart times={times_for_user.worked}
                                       sick_days={true}
                                       public_holidays={true}
                                       leave_days={true}
                                       office_closed={true}
                                       yaxis_datakey="daily_hours"
                                       xaxis_datakey="started_on"
                                       reference_line_hours={8}
                                       width={500}
                                       height={200}
                            />
                          </div>
                  ))}
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const timesheet_dashboard = getTimesheetDashboard(state)
    
    return {
	timesheet_dashboard: timesheet_dashboard || {}
    }
}

export default connect(mapStateToProps)(TimesheetDashboard)

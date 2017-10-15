import React, { Component } from 'react'
import { map, size } from 'lodash'
import { DragSource, DropTarget } from 'react-dnd'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { DndTypes } from '../actions/Dnd'
import '../sass/user-timesheet.scss'
import {
    getUserTimesheet,
    ensureUserTimesheetsLoaded
} from '../actions/UserTimesheets'
import { ensureUsersLoaded } from '../actions/Users'
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

        return (
            <div className="user_timesheet">
              { ! user_timesheet.id &&
                <div>Loading...</div>
              }
              { user_timesheet.id &&
                <div key={user_id} className="user_timesheet__chart">
                  <OtherUser user_id={user_id} />
                  <TimeChart times={user_timesheet.worked}
                             sick_days={true}
                             public_holidays={true}
                             leave_days={true}
                             office_closed={true}
                             average_hours_worked={user_timesheet.average_hours_worked}
                             average_hours_worked_warning_threshold={user_timesheet.required_daily_work_hours_warning_threshold}
                             reference_line_hours={user_timesheet.required_daily_work_hours}
                             show_y_axis={true}
                             yaxis_datakey="daily_hours"
                             xaxis_datakey="started_on"
                             width={500}
                             height={200}
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

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import "react-big-calendar/lib/css/react-big-calendar.css"

BigCalendar.momentLocalizer(moment); // or globalizeLocalizer


class PlanningCalendar extends Component {

    render() {
        return (
            <div className={'planning-calendar__calendar-container'}>
              <BigCalendar
                  events={[]}
                  startAccessor='startDate'
                  endAccessor='endDate'
              />
            </div>
        )
    }
    
}

function mapStateToProps(state, props) {

    const { schedule_id } = props
    
    return {
        schedule_id
    }
}

export default withRouter(connect(mapStateToProps)(PlanningCalendar))


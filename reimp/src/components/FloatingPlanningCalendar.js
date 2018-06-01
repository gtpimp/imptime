import React, {Component} from 'react'
import {connect} from 'react-redux'
import Rnd from 'react-rnd'
import moment from 'moment'
import classNames from 'classnames'
import { isFloatingCalendarVisible } from '../actions/CalendarEvents'
import {
    LIST_KEY__CALENDAR_EVENT_LIST
} from '../actions/ItemListKeyRegistry'
import {
    initList,
    update_list_filter
} from '../actions/ItemList'
import { setCurrentDate, hideFloatingCalendar } from '../actions/CalendarEvents'
import {
    getSchedule,
    ensureSchedulesLoaded,
    canEditScheduleEvents
} from '../actions/Schedules'
import { getLoggedInUser} from '../actions/Users'
import PlanningCalendar from './PlanningCalendar'

class FloatingPlanningCalendar extends Component {

    constructor(props) {
        super(props)
        this.onCancel = this.onCancel.bind(this)
        this.onResize = this.onResize.bind(this)
    }
    
    componentDidMount() {
        const {schedule_id, dispatch} = this.props
        dispatch(initList(LIST_KEY__CALENDAR_EVENT_LIST))
        dispatch(update_list_filter(LIST_KEY__CALENDAR_EVENT_LIST, {schedule_id:schedule_id || -1}))
        dispatch(setCurrentDate(LIST_KEY__CALENDAR_EVENT_LIST, moment()))
        dispatch(ensureSchedulesLoaded([schedule_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = new_props
        if ( new_props.schedule && (!this.props.schedule || new_props.schedule.id !== this.props.schedule.id) ) {
            dispatch(update_list_filter(LIST_KEY__CALENDAR_EVENT_LIST, {schedule_id:new_props.schedule.id || -1}))
            dispatch(ensureSchedulesLoaded([new_props.schedule_id]))
        }
    }

    onResize(e, dir, refToElement, delta, position) {
        /* this.container_el.style.height = this.container_el.style.height - delta.y
         * this.container_el.style.width = this.container_el.style.width - delta.x*/
    }

    onCancel() {
        const { dispatch } = this.props
        dispatch(hideFloatingCalendar())
    }

    render() {
        const { schedule, schedule_id, can_edit, show_popup } = this.props

        if ( ! show_popup ) {
            return null
        }
        
        return (
            <Rnd className={classNames("rnd rnd--topmost")}
                 dragHandleClassName=".rnd--header"
                 onResize={this.onResize}
            >
              <div className="rnd--container"
                   ref={(ref)=> this.container_el=ref}
              >
                <div className="rnd--header">
                  <h3 >
                    {schedule.name}
                  </h3>
                  <div className="rnd__close">
                    <i className="material-icons" onClick={this.onCancel}>close</i>
                  </div>
                </div>
                <div className="rnd--body">
                  <PlanningCalendar schedule_id={schedule_id}
                                    can_edit={can_edit}
                                    list_key={LIST_KEY__CALENDAR_EVENT_LIST} />
                </div>
              </div>
            </Rnd>
        )
    }
}

function mapStateToProps(state, props) {
    const logged_in_user = getLoggedInUser(state) || {}
    const schedule_id = logged_in_user.default_schedule_id
    const schedule = getSchedule(state, schedule_id) || {}
    const can_edit = canEditScheduleEvents(schedule)
    const show_popup = isFloatingCalendarVisible(state)
    
    return {
        schedule_id,
        schedule,
        can_edit,
        show_popup
    }
}


export default connect(mapStateToProps)(FloatingPlanningCalendar)

import React, {Component} from 'react'
import {connect} from 'react-redux'
import Rnd from 'react-rnd'
import classNames from 'classnames'
import Splitter from './Splitter'
import ScheduleList from './ScheduleList'
import { isFloatingCalendarVisible } from '../actions/CalendarEvents'
import {
    LIST_KEY__CALENDAR_EVENT_LIST,
    BRIEF_SCHEDULE_HEADER_LIST,
    LIST_KEY__SCHEDULE_LIST
} from '../actions/ItemListKeyRegistry'
import {
    initList,
    getSelectedItemId,
    selectItems
} from '../actions/ItemList'
import { hideFloatingCalendar } from '../actions/CalendarEvents'
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
        this.onClickedSchedule = this.onClickedSchedule.bind(this)
    }
    
    componentDidMount() {
        const {schedule_id, dispatch} = this.props
        dispatch(initList(LIST_KEY__CALENDAR_EVENT_LIST))
        dispatch(ensureSchedulesLoaded([schedule_id]))
    }

    componentWillReceiveProps(new_props) {
        const { selected_schedule_id, default_schedule_id, dispatch } = new_props
        if ( !selected_schedule_id && default_schedule_id ) {
            dispatch(selectItems(LIST_KEY__SCHEDULE_LIST, [default_schedule_id]))
        }
        if ( new_props.schedule && (!this.props.schedule || new_props.schedule.id !== this.props.schedule.id) ) {
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

    onClickedSchedule(schedule_id) {
        const { dispatch } = this.props
        dispatch(selectItems(LIST_KEY__SCHEDULE_LIST, [schedule_id]))
    }

    render() {
        const { schedule, schedule_id, can_edit, show_popup, schedule_header_list } = this.props
        const that = this

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
                  <Splitter name="floating-planning-calendar"
                            defaultSize="10%">
                    <ScheduleList list_key={LIST_KEY__SCHEDULE_LIST}
                                  header_list={schedule_header_list}
                                  onClickedSchedule={that.onClickedSchedule}
                    />
                    <PlanningCalendar schedule_id={schedule_id}
                                      can_edit={can_edit}
                                      list_key={LIST_KEY__CALENDAR_EVENT_LIST} />
                  </Splitter>
                </div>
              </div>
            </Rnd>
        )
    }
}

function mapStateToProps(state, props) {
    const logged_in_user = getLoggedInUser(state) || {}
    const default_schedule_id = logged_in_user.default_schedule_id
    const selected_schedule_id = getSelectedItemId(state, LIST_KEY__SCHEDULE_LIST)
    const schedule_id = selected_schedule_id || default_schedule_id
    const schedule = getSchedule(state, schedule_id) || {}
    const can_edit = canEditScheduleEvents(schedule)
    const show_popup = isFloatingCalendarVisible(state)
    const schedule_header_list = BRIEF_SCHEDULE_HEADER_LIST
    
    return {
        selected_schedule_id,
        schedule_id,
        schedule,
        can_edit,
        show_popup,
        schedule_header_list,
        default_schedule_id
    }
}


export default connect(mapStateToProps)(FloatingPlanningCalendar)

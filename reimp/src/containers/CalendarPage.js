import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import moment from 'moment';
import { getLoggedInUser } from '../actions/Users'
import {
    LIST_KEY__CALENDAR_EVENT_LIST,
    PAGE_KEY__CALENDAR_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars
} from '../actions/Page'
import {
    initList,
    update_list_filter
} from '../actions/ItemList'
import {getSchedule, ensureSchedulesLoaded, canEditScheduleEvents} from '../actions/Schedules'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import PlanningCalendar from '../components/PlanningCalendar'
import { setCurrentDate } from '../actions/CalendarEvents'

class ScheduleItemPage extends Component {

    componentDidMount() {
        const {schedule_id, dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__CALENDAR_PAGE, ['calendar']))
        dispatch(initList(LIST_KEY__CALENDAR_EVENT_LIST))
        dispatch(update_list_filter(LIST_KEY__CALENDAR_EVENT_LIST, {schedule_id:schedule_id || -1}))
        dispatch(setCurrentDate(LIST_KEY__CALENDAR_EVENT_LIST, moment()))
        dispatch(ensureSchedulesLoaded([schedule_id]))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = new_props
        if ( new_props.schedule && (!this.props.schedule || new_props.schedule.id !== this.props.schedule.id) ) {
            dispatch(update_list_filter(LIST_KEY__CALENDAR_EVENT_LIST, {schedule_id:new_props.schedule.id || -1}))
            dispatch(ensureSchedulesLoaded([new_props.schedule_id]))
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch } = props
        const breadcrumbs = [ {to: '/calendar',
                               label: 'Calendar',
                               type: 'calendar'} ]
        dispatch(setBreadcrumbs(breadcrumbs))
    }

    render() {
        const { schedule_id, schedule, can_edit } = this.props
        return (
            <div className="main-layout__scroll-panel">
              <h3>{schedule.name}</h3>
              <PlanningCalendar schedule_id={schedule_id}
                                can_edit={can_edit}
                                list_key={LIST_KEY__CALENDAR_EVENT_LIST}
              />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const logged_in_user = getLoggedInUser(state) || {}
    const schedule_id = logged_in_user.default_schedule_id
    const schedule = getSchedule(state, schedule_id) || {}
    const can_edit = canEditScheduleEvents(schedule)

    return {
        schedule_id,
        schedule,
        can_edit
    }
}

export default withRouter(connect(mapStateToProps)(ScheduleItemPage))

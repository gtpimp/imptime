import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import "react-big-calendar/lib/css/react-big-calendar.css"
import {
    fetchCalendarEventsIfNeeded,
    getCurrentDate,
    setCurrentDate
} from '../actions/CalendarEvents'
import {
    update_list_filter,
    getListFilter,
    invalidateList,
    getVisibleItemIds,
    getVisibleItems
} from '../actions/ItemList'
import {
    ENTITY_KEY__SCHEDULE_ITEM
} from '../actions/ItemListKeyRegistry'

BigCalendar.momentLocalizer(moment); // or globalizeLocalizer


class PlanningCalendar extends Component {

    constructor(props) {
        super(props)
        this.onNavigate = this.onNavigate.bind(this)
        this.onView = this.onView.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, filter, list_key } = props
        if ( filter.start_at__lte && filter.end_at__gte ) {
            dispatch(fetchCalendarEventsIfNeeded(list_key))
        }
    }

    onNavigate(new_date, view, action) {
        const { dispatch, list_key, current_date } = this.props
        new_date = moment(new_date)
        if ( current_date.month() !== new_date.month()) {
            this.onDateRangeChanged(moment(new_date).subtract(1, 'months'),
                                    moment(new_date).add(2, 'months'))
        }
        dispatch(setCurrentDate(list_key, new_date))
    }

    onView(view) {
        const { current_date } = this.props
        this.onNavigate(current_date, view, "view")
    }

    onDateRangeChanged(date_from_inclusive, date_to_inclusive) {
        const { dispatch, list_key } = this.props
        dispatch(update_list_filter(list_key, {end_at__gte: date_from_inclusive,
                                               start_at__lte: date_to_inclusive}))
        dispatch(invalidateList(list_key))
    }
    
    render() {
        const { events, current_date } = this.props
        return (
            <div className={'planning-calendar__calendar-container'}>
              <BigCalendar
                  events={events}
                  defaultView='day'
                  defaultDate={current_date.toDate()}
                  startAccessor='start_at'
                  endAccessor='end_at'
                  onNavigate={this.onNavigate}
                  onView={this.onView}
              />
            </div>
        )
    }
    
}

function mapStateToProps(state, props) {

    const { schedule_id, list_key } = props
    const filter = getListFilter(state, list_key)
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__SCHEDULE_ITEM)
    const current_date = getCurrentDate(state, list_key)
    
    return {
        schedule_id,
        filter,
        event_ids: visible_item_ids,
        events: visible_items,
        current_date
    }
}

export default withRouter(connect(mapStateToProps)(PlanningCalendar))


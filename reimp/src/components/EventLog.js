import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import BigCalendar from 'react-big-calendar'
import "react-big-calendar/lib/css/react-big-calendar.css"
import OtherUser from './OtherUser'
import IssueName from './IssueName'
import {
    ensureEventLogLoaded,
    getEventLog,
    isLoadingEventLog,
    invalidateEventLog
} from '../actions/EventLogs'
import { makeSelGetEventsForCalendar } from '../selectors/EventLogSelectors'
import {
    update_list_filter,
    getListFilter,
    invalidateList
} from '../actions/ItemList'
import moment from 'moment'
import Loading from './Loading'
import ModalDialog from './ModalDialog'
import 'react-datepicker/dist/react-datepicker.css'
import PopupPanelHeading from './PopupPanelHeading'
import PopupPanelText from './PopupPanelText'
import Timestamp from './Timestamp'

BigCalendar.momentLocalizer(moment)

class EventLog extends Component {

    constructor(props) {
        super(props)
        this.state = {current_date: moment(),
                      current_view: 'day',
                      selected_event: null}
    }
    
    componentDidMount() {
        const { dispatch, list_key, project_id, filter } = this.props
        dispatch(update_list_filter(list_key, filter))
        
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            dispatch(ensureEventLogLoaded(filter))
            dispatch(invalidateEventLog(filter))
        }
    }

    componentDidUpdate(prev_props) {
        const { dispatch, filter, project_id } = this.props
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            dispatch(ensureEventLogLoaded(filter))
        }
    }

    setCurrentDate(new_date) {
        this.setState({'current_date': moment(new_date)})
    }
    
    setCurrentView(new_view) {
        const { current_date } = this.state
        this.setState({'current_view': new_view})
        this.onNavigate(current_date, new_view, 'view')
    }

    refreshEventLog = () => {
        const { filter, dispatch } = this.props
        dispatch(invalidateEventLog(filter))
    }

    onNavigate = (new_date, view, action) => {
        const { current_date, current_view } = this.state
        new_date = moment(new_date)
        switch( view ) {
            case "month":
                if ( current_view !== view || current_date.month() !== new_date.month()) {
                    this.onDateRangeChanged(moment(new_date).subtract(1, 'months'),
                                            moment(new_date).add(1, 'months'))
                }
                break
            case "week":
                if ( current_view !== view || current_date.day() !== new_date.day()) {
                    this.onDateRangeChanged(moment(new_date).subtract(7, 'day'),
                                            moment(new_date).add(7, 'day'))
                }
                break
            case "day":
                if ( current_view !== view || current_date.day() !== new_date.day()) {
                    this.onDateRangeChanged(moment(new_date).subtract(1, 'day'),
                                            moment(new_date).add(1, 'day'))
                }
                break
            default:
                console.error("Unknown view " + view)
        }
        
        this.setCurrentDate(new_date)
    }

    onView = (view) => {
        const { current_date } = this.props
        this.onNavigate(current_date, view, "view")
        this.setCurrentView(view)
    }

    onDateRangeChanged(date_from_inclusive, date_to_inclusive) {
        const { dispatch, list_key } = this.props
        dispatch(update_list_filter(list_key, {date_from_inclusive: date_from_inclusive,
                                               date_to_inclusive: date_to_inclusive}))
        dispatch(invalidateList(list_key))
    }

    getCalendarEventStartAt = (calendar_event) => {
        return moment(calendar_event.start_at).toDate()
    }
    
    getCalendarEventEndAt = (calendar_event) => {
        return moment(calendar_event.end_at).toDate()
    }

    onSelectEvent = (event, evt) => {
        this.setState({selected_event:event})
    }

    closeSelectedEventPopup = (event) => {
        this.setState({selected_event:null})
    }

    renderSelectedEvent(calendar_event) {
        return (
            <ModalDialog isOpen={true}
                         onClose={this.closeSelectedEventPopup}
                         title=""
                         variant="large">
                { calendar_event.type === "issue_history" && 
                  (
                      <div>
                        <PopupPanelHeading>
                          <div>
                            Issue history
                          </div>
                          <div>
                            <IssueName issue_id={calendar_event.obj.issue_id} />
                          </div>
                        </PopupPanelHeading>
                        <PopupPanelText>
                          <Timestamp value={calendar_event.obj.created_at} />
                        </PopupPanelText>
                        <PopupPanelText>
                          <OtherUser user_id={calendar_event.obj.created_by_user_id} />
                          <div>
                            {calendar_event.obj.description}
                          </div>
                          <div>
                            from {calendar_event.obj.before}
                          </div>
                          <div>
                            to {calendar_event.obj.after}
                          </div>
                          
                          
                        </PopupPanelText>
                      </div>
                  )
                }
            </ModalDialog>
        )
    }    

    renderTitle = (event_log) => {
        var res = null
        switch(event_log.type) {
            case "issue_history":
                res = (
                    <div>
                      <IssueName issue_id={event_log.obj.issue_id} open_on_click={false} /> : 
                      {event_log.obj.description} -> 
                      {event_log.obj.after}
                    </div>
                )
                break
            case "clock_entry":
                res = (
                    <div>
                      <OtherUser user_id={event_log.obj.user_id} />
                      <IssueName issue_id={event_log.obj.issue_id} />
                    </div>
                )
                break
            default:
                res = (
                    <span>Unknown entry type: {event_log.type}</span>
                )
                break
        }
        return res
    }

    render() {

        const { is_loading, event_logs_for_calendar } = this.props
        const { current_view, current_date, selected_event } = this.state

        return (
            <div>
              { is_loading &&
                <div>
                  <br/>
                  <Loading />
                </div>
              }

              <div>
                <BigCalendar
                    events={event_logs_for_calendar}
                    defaultView={current_view}
                    defaultDate={current_date.toDate()}
                    startAccessor={this.getCalendarEventStartAt}
                    endAccessor={this.getCalendarEventEndAt}
                    titleAccessor={this.renderTitle}
                    selectable={true}
                    timeslots={4}
                    onNavigate={this.onNavigate}
                    onView={this.onView}
                    onSelectEvent={this.onSelectEvent}
                    
                />
              </div>
              { selected_event && this.renderSelectedEvent(selected_event) }
            </div>
        )
    }
}

const makeMapStateToProps = () => {
    const selGetEventsForCalendar = makeSelGetEventsForCalendar()
            
    const mapStateToProps = (state, props) => {
        const { project_id, list_key } = props
        const project = getProject(state, project_id) || {}
        const filter = getListFilter(state, list_key)
        const event_log = filter && getEventLog(state, filter)

        if ( ! filter.date_from_inclusive ) {
            filter.date_from_inclusive = moment().subtract(1, 'days');
        }
        if ( ! filter.date_to_inclusive ) {
            filter.date_to_inclusive = moment().add(1, 'days');
        }
        if (! filter.project_id ) {
            filter.project_id = project_id
        }

        const event_logs_for_calendar = selGetEventsForCalendar(state, props)
        
        const is_loading = !event_log || isLoadingEventLog(state, filter)
        
        return {
            list_key,
            project_id,
            project,
            event_log,
            event_logs_for_calendar,
            is_loading,
            filter,
        }
    }
    return mapStateToProps
}

export default connect(makeMapStateToProps)(EventLog)

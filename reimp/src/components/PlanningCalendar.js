import React, {Component} from 'react'
import {connect} from 'react-redux'
import { filter } from 'lodash'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import BigCalendar from 'react-big-calendar'
import ScheduleItemTitle from './ScheduleItemTitle'
import ScheduleItemBody from './ScheduleItemBody'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from 'moment';
import "react-big-calendar/lib/css/react-big-calendar.css"
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import {
    fetchCalendarEventsIfNeeded,
    getCurrentDate,
    setCurrentDate,
    getCurrentView,
    setCurrentView,
    createCalendarEvent,
    updateCalendarEventDates,
} from '../actions/CalendarEvents'
import {
    update_list_filter,
    getListFilter,
    invalidateList,
    getNestedObjects,    
    ensureNestedObjectsLoaded,
    getVisibleItemIds,
    getVisibleItems,
    isInvalidated,
    isLoading
} from '../actions/ItemList'
import { ensureSchedulesLoaded } from '../actions/Schedules'
import { isLoadingItems } from '../actions/Item'
import { getGloballySelectedEntityIds } from '../actions/Page'
import {
    ENTITY_KEY__CALENDAR_EVENT
} from '../actions/ItemListKeyRegistry'
import ModalDialog from './ModalDialog'
import TimestampRange from './TimestampRange'
import ProjectName from './ProjectName'
import SprintName from './SprintName'
import IssueName from './IssueName'
import IssueSelectorForm from './form/IssueSelectorForm'
import PopupPanelButton from './PopupPanelButton'
import PopupPanelMiniButton from './PopupPanelMiniButton'
import PopupPanelHeading from './PopupPanelHeading'

BigCalendar.momentLocalizer(moment)

const DragAndDropCalendar = withDragAndDrop(BigCalendar)

const DEFAULT_EVENT_DURATION_HOURS = 2

class PlanningCalendar extends Component {

    constructor(props) {
        super(props)
        this.onNavigate = this.onNavigate.bind(this)
        this.onView = this.onView.bind(this)
        this.renderTitle = this.renderTitle.bind(this)
        this.onSelectSlot = this.onSelectSlot.bind(this)
        this.onSelectEvent = this.onSelectEvent.bind(this)
        this.closeSelectedEventPopup = this.closeSelectedEventPopup.bind(this)
        this.onMovedEvent = this.onMovedEvent.bind(this)
        this.onResizedEvent = this.onResizedEvent.bind(this)
        this.stopAddingItem = this.stopAddingItem.bind(this)
        this.addProjectToSchedule = this.addProjectToSchedule.bind(this)
        this.addSprintToSchedule = this.addSprintToSchedule.bind(this)
        this.addIssueToSchedule = this.addIssueToSchedule.bind(this)
        this.getCalendarEventStartAt = this.getCalendarEventStartAt.bind(this)
        this.getCalendarEventEndAt = this.getCalendarEventEndAt.bind(this)
        this.onStartSelectingIssue = this.onStartSelectingIssue.bind(this)
        this.onStopSelectingIssue = this.onStopSelectingIssue.bind(this)
        this.onSelectedIssue = this.onSelectedIssue.bind(this)
        this.state = { adding_item: false,
                       slotInfo: null,
                       selectedEvent: null,
                       selecting_issue: false}
    }
    
    componentDidMount() {
        const { dispatch, list_key, filter, schedule_id } = this.props
        dispatch(update_list_filter(list_key, {schedule_id:schedule_id || -1}))
        if ( ! filter.start_at || ! filter.end_at ) {
            dispatch(update_list_filter(list_key, {start_at: moment().subtract(1, 'months'),
                                                   end_at: moment().add(1, 'months')}))
            dispatch(invalidateList(list_key))
        }
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, filter, list_key, schedule_id, nested_objects } = props
        if ( schedule_id !== this.props.schedule_id ) {
            dispatch(update_list_filter(list_key, {schedule_id:schedule_id || -1}))
            dispatch(invalidateList(list_key))
        }
        if ( filter.start_at && filter.end_at ) {
            dispatch(fetchCalendarEventsIfNeeded(list_key))
        }
        dispatch(ensureSchedulesLoaded([schedule_id]))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
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
        const { dispatch, list_key, current_date } = this.props
        this.onNavigate(current_date, view, "view")
        dispatch(setCurrentView(list_key, view))
    }

    onDateRangeChanged(date_from_inclusive, date_to_inclusive) {
        const { dispatch, list_key } = this.props
        dispatch(update_list_filter(list_key, {start_at: date_from_inclusive,
                                               end_at: date_to_inclusive}))
        dispatch(invalidateList(list_key))
    }

    onSelectSlot(slot_info) {
        const { action } = slot_info
        if ( action === 'click' ) {
            this.startAddingItem(slot_info)
        }
    }

    onMovedEvent({event, start, end}) {
        const { dispatch } = this.props
        dispatch(updateCalendarEventDates(event.id, moment(start), moment(end)))
    }

    onResizedEvent(resizeType, {event, start, end}) {
        const { dispatch } = this.props
        dispatch(updateCalendarEventDates(event.id, moment(start), moment(end)))
    }

    startAddingItem(slot_info) {
        this.setState({adding_item: true, slot_info: slot_info})
    }

    stopAddingItem() {
        this.setState({adding_item:false})
    }

    addProjectToSchedule(evt) {
        const { entityIdsAvailableForEventCreation } = this.props
        const { project_id } = entityIdsAvailableForEventCreation || {}
        this.addToSchedule(evt, {project_id: project_id})
    }
    
    addSprintToSchedule(evt) {
        const { entityIdsAvailableForEventCreation } = this.props
        const { project_id, sprint_id } = entityIdsAvailableForEventCreation || {}
        this.addToSchedule(evt, {project_id: project_id, sprint_id: sprint_id})
    }
    
    addIssueToSchedule(evt) {
        const { entityIdsAvailableForEventCreation } = this.props
        const { project_id, sprint_id, issue_id } = entityIdsAvailableForEventCreation || {}
        this.addToSchedule(evt, {project_id: project_id, sprint_id: sprint_id, issue_id: issue_id})
    }

    addToSchedule(evt, entity_ids) {
        const { dispatch, schedule_id } = this.props
        const { start } = this.state.slot_info
        var end = moment(start).add(DEFAULT_EVENT_DURATION_HOURS,'hours')
        if ( evt ) {
            evt.preventDefault()
        }
        dispatch(createCalendarEvent(schedule_id, start, end, entity_ids))
        this.stopAddingItem()
    }

    onSelectEvent(event, evt) {
        const { onSelectEvent } = this.props
        this.setState({selectedEvent:event})
        if ( onSelectEvent ) {
            onSelectEvent(event)
        }
    }

    closeSelectedEventPopup(event) {
        this.setState({selectedEvent:null})
    }

    getCalendarEventStartAt(calendar_event) {
        return moment(calendar_event.start_at).toDate()
    }
    
    getCalendarEventEndAt(calendar_event) {
        return moment(calendar_event.end_at).toDate()
    }

    onStartSelectingIssue(evt) {
        if ( evt ) {
            evt.preventDefault()
        }
        this.stopAddingItem()
        this.setState({selecting_issue:true})
    }

    onStopSelectingIssue() {
        this.setState({selecting_issue:false})
    }
    
    onSelectedIssue(new_values) {
        const { issue_id, sprint_id, project_id } = new_values
        this.addToSchedule(null, {project_id: project_id, sprint_id: sprint_id, issue_id: issue_id})
        this.onStopSelectingIssue()
    }

    renderTitle(calendar_event) {
        return (
            <ScheduleItemTitle schedule_item={calendar_event} />
        )
    }

    renderSelectIssue(calendar_event) {
        const { start, end } = this.state.slot_info
        
        return (
            <ModalDialog isOpen={true}
                         onClose={this.onStopSelectingIssue}
                         title="Select issue for schedule"
                         variant="large">
              <div className="editable-property-modal__row editable-property-modal__row--header">
                <label className="editable-property-modal__title">
                  Select or create an issue, scheduled for
                  <TimestampRange start={start} end={end}
                                  range_format="single-day"
                                  time_format="short-time" />
                </label>
              </div>
              <IssueSelectorForm optional_default_issue_values={{issue_type:'management-meeting'}}
                                 onSubmitted={this.onSelectedIssue}/>
            </ModalDialog>
        )
    }

    renderSelectedEvent(calendar_event) {
        const { can_edit } = this.props
        return (
            <ModalDialog isOpen={true}
                         onClose={this.closeSelectedEventPopup}
                         title="Scheduled item"
                         variant="large">
              <div className="editable-property-modal__row editable-property-modal__row--header">
                <label htmlFor="assigned" className="editable-property-modal__title">
                  <TimestampRange start={calendar_event.start_at}
                                  end={calendar_event.end_at}
                                  range_format="single-day"
                                  time_format="short-time" />
                </label>
              </div>
              <ScheduleItemBody schedule_item={calendar_event}
                                can_edit={can_edit}
                                onDeleted={this.closeSelectedEventPopup}
              />
            </ModalDialog>
        )
    }
    
    renderAddingItem() {
        const { entityIdsAvailableForEventCreation } = this.props
        const { project_id, sprint_id, issue_id } = entityIdsAvailableForEventCreation || {}
        const { start, end } = this.state.slot_info
        const something_selected = project_id || sprint_id || issue_id
        return (
            <ModalDialog isOpen={true}
                         onClose={this.stopAddingItem}
                         title="Add scheduled item"
                         variant="large">
              <div className="editable-property-modal__row editable-property-modal__row--header">
                <label htmlFor="assigned" className="editable-property-modal__title">{this.props.actionLabel}</label>
              </div>
              <div className="editable-property-modal__content">
                <PopupPanelHeading>
                  Scheduling <TimestampRange start={start} end={end}
                                             range_format="single-day"
                                             time_format="short-time" />

                </PopupPanelHeading>
                <div className="editable-property-modal__title">
                  { something_selected &&
                    <div>Schedule most recently selected issue:</div>
                  }
                </div>
                { project_id && 
                  <div className="editable-property-modal__row"
                       onClick={(event) => this.addProjectToSchedule(event, project_id)}>
                    <PopupPanelMiniButton>Schedule project</PopupPanelMiniButton>
                    <ProjectName project_id={project_id} />
                  </div>
                }
                { sprint_id && 
                  <div className="editable-property-modal__row"
                       onClick={(event) => this.addSprintToSchedule(event, sprint_id)}>
                    <PopupPanelMiniButton>Schedule sprint</PopupPanelMiniButton>
                    <SprintName sprint_id={sprint_id} />
                  </div>
                }
                { issue_id && 
                  <div className="editable-property-modal__row"
                       onClick={(event) => this.addIssueToSchedule(event, issue_id)}>
                    <PopupPanelMiniButton>Schedule issue</PopupPanelMiniButton>
                    <IssueName issue_id={issue_id} />
                  </div>
                }

                <div className="editable-property-modal__title">
                    {something_selected && "Or "}
                  choose a different issue for this event
                  <PopupPanelButton onClick={this.onStartSelectingIssue}>
                    Select issue
                  </PopupPanelButton>
                </div>

              </div>

            </ModalDialog>            
        )
    }

    render() {
        const { events, current_date, current_view, can_edit } = this.props

        const loaded_events = filter(events, (event) => event.start_at && event.end_at)
        
        return (
            <div className={'planning-calendar__calendar-container'}>
              <DragAndDropCalendar
                  events={loaded_events}
                  defaultView={current_view || 'day'}
                  defaultDate={(current_date || moment()).toDate()}
                  startAccessor={this.getCalendarEventStartAt}
                  endAccessor={this.getCalendarEventEndAt}
                  titleAccessor={this.renderTitle}
                  onNavigate={this.onNavigate}
                  onView={this.onView}
                  onSelectSlot={this.onSelectSlot}
                  onSelectEvent={this.onSelectEvent}
                  selectable={can_edit}
                  timeslots={4}
                  resizable
                  onEventDrop={this.onMovedEvent}
                  onEventResize={this.onResizedEvent}
              />
              { this.state.adding_item && this.renderAddingItem() }
              { this.state.selecting_issue && this.renderSelectIssue() }
              { this.state.selectedEvent && this.renderSelectedEvent(this.state.selectedEvent) }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { schedule_id, list_key, can_edit, onSelectEvent } = props
    const filter = getListFilter(state, list_key)
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__CALENDAR_EVENT)
    const current_date = getCurrentDate(state, list_key)
    const current_view = getCurrentView(state, list_key)
    const nested_objects = getNestedObjects(state, list_key)
    const entityIdsAvailableForEventCreation = getGloballySelectedEntityIds(state)
    const is_loading = isLoadingItems(state, ENTITY_KEY__CALENDAR_EVENT, visible_item_ids) || isLoading(state, ENTITY_KEY__CALENDAR_EVENT)
    const is_invalidated = isInvalidated(state, ENTITY_KEY__CALENDAR_EVENT)
    
    return {
        schedule_id,
        filter,
        event_ids: visible_item_ids,
        events: visible_items,
        current_date,
        current_view,
        can_edit,
        entityIdsAvailableForEventCreation,
        is_loading,
        is_invalidated,
        nested_objects,
        onSelectEvent
    }
}

PlanningCalendar = DragDropContext(HTML5Backend)(PlanningCalendar)
export default connect(mapStateToProps)(PlanningCalendar)


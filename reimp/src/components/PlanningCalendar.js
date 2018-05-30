import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import "react-big-calendar/lib/css/react-big-calendar.css"
import {
    fetchCalendarEventsIfNeeded,
    getCurrentDate,
    setCurrentDate,
    createCalendarEvent
} from '../actions/CalendarEvents'
import {
    update_list_filter,
    getListFilter,
    invalidateList,
    getVisibleItemIds,
    getVisibleItems
} from '../actions/ItemList'
import { getGloballySelectedEntityIds } from '../actions/Page'
import {
    ENTITY_KEY__SCHEDULE_ITEM
} from '../actions/ItemListKeyRegistry'
import Modal from 'react-modal'
import Timestamp from './Timestamp'
import ProjectName from './ProjectName'
import SprintName from './SprintName'
import IssueName from './IssueName'

BigCalendar.momentLocalizer(moment); // or globalizeLocalizer


class PlanningCalendar extends Component {

    constructor(props) {
        super(props)
        this.onNavigate = this.onNavigate.bind(this)
        this.onView = this.onView.bind(this)
        this.onSelectSlot = this.onSelectSlot.bind(this)
        this.stopAddingItem = this.stopAddingItem.bind(this)
        this.addProjectToSchedule = this.addProjectToSchedule.bind(this)
        this.addSprintToSchedule = this.addSprintToSchedule.bind(this)
        this.addIssueToSchedule = this.addIssueToSchedule.bind(this)        
        this.state = { adding_item: false,
                       slotInfo: null }
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

    onSelectSlot(slot_info) {
        const { action } = slot_info
        if ( action === 'click' ) {
            this.startAddingItem(slot_info)
        }
    }

    startAddingItem(slot_info) {
        this.setState({adding_item: true, slot_info: slot_info})
    }

    stopAddingItem() {
        this.setState({adding_item:false})
    }

    addProjectToSchedule(event) {
        const { entityIdsAvailableForEventCreation } = this.props
        const { project_id } = entityIdsAvailableForEventCreation || {}
        this.addToSchedule(event, {project_id: project_id})
    }
    
    addSprintToSchedule(event) {
        const { entityIdsAvailableForEventCreation } = this.props
        const { project_id, sprint_id } = entityIdsAvailableForEventCreation || {}
        this.addToSchedule(event, {project_id: project_id, sprint_id: sprint_id})
    }
    
    addIssueToSchedule(event) {
        const { entityIdsAvailableForEventCreation } = this.props
        const { project_id, sprint_id, issue_id } = entityIdsAvailableForEventCreation || {}
        this.addToSchedule(event, {project_id: project_id, sprint_id: sprint_id, issue_id: issue_id})
    }

    addToSchedule(event, entity_ids) {
        const { dispatch, schedule_id } = this.props
        const { start, end } = this.state.slot_info
        if ( event ) {
            event.preventDefault()
        }
        dispatch(createCalendarEvent(schedule_id, start, end, entity_ids))
        this.stopAddingItem()
    }

    renderAddingItem() {
        const { entityIdsAvailableForEventCreation } = this.props
        const { project_id, sprint_id, issue_id } = entityIdsAvailableForEventCreation || {}
        const { start, end } = this.state.slot_info
        return (
            <Modal isOpen={true}
                   className="editable-property-modal"
                   overlayClassName="editable-property-modal__overlay"
                   onRequestClose={this.stopAddingItem}
                   contentLabel="Add scheduled item">
              <div className="editable-property-modal__row editable-property-modal__row--header">
                <label htmlFor="assigned" className="editable-property-modal__title">{this.props.actionLabel}</label>
                <div className="editable-property-modal__close">
                  <i className="material-icons" onClick={this.stopAddingItem}>close</i>
                </div>
              </div>
              <div className="editable-property-modal__content">
                <div className="editable-property-modal__title">
                  Add new scheduled item
                </div>
                <div className="editable-property-modal__row">
                  Start at <Timestamp value={start} />
                </div>
                <div className="editable-property-modal__row">
                  End at <Timestamp value={end} />
                </div>
                <div className="editable-property-modal__title">
                  Choose what to schedule:
                </div>
                { project_id && 
                  <div className="editable-property-modal__row"
                       onClick={(event) => this.addProjectToSchedule(event, project_id)}>
                    <div className="icon--add-to-schedule"/>
                    <ProjectName project_id={project_id} />
                  </div>
                }
                { sprint_id && 
                  <div className="editable-property-modal__row"
                       onClick={(event) => this.addSprintToSchedule(event, sprint_id)}>
                    <div className="icon--add-to-schedule"/>
                    <SprintName sprint_id={sprint_id} />
                  </div>
                }
                { issue_id && 
                  <div className="editable-property-modal__row"
                       onClick={(event) => this.addIssueToSchedule(event, issue_id)}>
                    <div className="icon--add-to-schedule"/>
                    <IssueName issue_id={issue_id} />
                  </div>
                }
              </div>
            </Modal>            
        )
    }
    
    render() {
        const { events, current_date, can_edit } = this.props
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
                  onSelectSlot={this.onSelectSlot}
                  selectable={can_edit}
              />
              { this.state.adding_item && this.renderAddingItem() }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { schedule_id, list_key, can_edit } = props
    const filter = getListFilter(state, list_key)
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__SCHEDULE_ITEM)
    const current_date = getCurrentDate(state, list_key)
    const entityIdsAvailableForEventCreation = getGloballySelectedEntityIds(state)
    
    return {
        schedule_id,
        filter,
        event_ids: visible_item_ids,
        events: visible_items,
        current_date,
        can_edit,
        entityIdsAvailableForEventCreation
    }
}

export default withRouter(connect(mapStateToProps)(PlanningCalendar))


import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import moment from 'moment';
import { getLoggedInUser } from '../actions/Users'
import Splitter from '../components/Splitter'
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
import IssueSidebar from '../components/IssueSidebar'
import SprintSidebar from '../components/SprintSidebar'
import ProjectSidebar from '../components/ProjectSidebar'

class ScheduleItemPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectEvent = this.onSelectEvent.bind(this)
    }
    
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

    onSelectEvent(event) {
        const { history } = this.props
        const { schedule_id, issue_id, sprint_id, project_id } = event
        if ( issue_id ) {
            history.push('/calendar/'+schedule_id+'/projects/'+project_id+'/sprints/'+sprint_id+'/issues/'+issue_id)
        } else if ( sprint_id ) {
            history.push('/calendar/'+schedule_id+'/projects/'+project_id+'/sprints/'+sprint_id)
        } else if ( project_id ) {
            history.push('/calendar/'+schedule_id+'/projects/'+project_id)
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

    renderRightPane() {
        const { issue_id, sprint_id, project_id } = this.props
        if ( issue_id ) {
            return <IssueSidebar issue_id={issue_id} sprint_id={sprint_id} project_id={project_id} sidebar_view_mode="right" />
        } else if ( sprint_id ) {
            return <SprintSidebar sprint_id={sprint_id} project_id={project_id} />
        } else if ( project_id ) {
            return <ProjectSidebar project_id={project_id} />
        }
    }

    renderLeftPane() {
        const { schedule_id, schedule, can_edit } = this.props
        return (
            <div>
              <h3>{schedule.name}</h3>
              <PlanningCalendar schedule_id={schedule_id}
                                can_edit={can_edit}
                                list_key={LIST_KEY__CALENDAR_EVENT_LIST}
                                onSelectEvent={this.onSelectEvent}
              />
            </div>
        )
    }

    render() {
        const { render_right_panel } = this.props

        if ( render_right_panel ) {
            return (
                <Splitter name="calendar_page">
                  {this.renderLeftPane()}
                  {this.renderRightPane()}
                </Splitter>
            )
        } else {
            return (
                <div className="main-layout__scroll-panel">
                  { this.renderLeftPane() }
                </div>
            )
        }
    }
}

function mapStateToProps(state, props) {

    const logged_in_user = getLoggedInUser(state) || {}
    const schedule_id = props.match.params.scheduleId || logged_in_user.default_schedule_id
    const schedule = getSchedule(state, schedule_id) || {}
    const can_edit = canEditScheduleEvents(schedule)
    const project_id = props.match.params.projectId
    const sprint_id = props.match.params.sprintId
    const issue_id = props.match.params.issueId
    const render_right_panel = project_id || sprint_id || issue_id

    return {
        schedule_id,
        schedule,
        can_edit,
        project_id,
        sprint_id,
        issue_id,
        render_right_panel
    }
}

export default withRouter(connect(mapStateToProps)(ScheduleItemPage))

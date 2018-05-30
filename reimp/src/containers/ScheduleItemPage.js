import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import moment from 'moment';
import Splitter from '../components/Splitter'
import {
    LIST_KEY__SCHEDULE_ITEM_LIST,
    PAGE_KEY__SCHEDULE_ITEM_PAGE,
    LIST_KEY__NUDGE_LIST
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    setGloballySelectedEntityIds
} from '../actions/Page'
import {
    initList,
    update_list_filter
} from '../actions/ItemList'
import {getSchedule, ensureSchedulesLoaded, canEditScheduleEvents} from '../actions/Schedules'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import NudgeList from '../components/NudgeList'
import PlanningCalendar from '../components/PlanningCalendar'
import { setCurrentDate } from '../actions/CalendarEvents'
import { getNudgeHeaderListForCurrentMien } from '../actions/Nudges'

class ScheduleItemPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectNudge = this.onSelectNudge.bind(this)
    } 
    
    componentDidMount() {
        const {schedule_id, dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__SCHEDULE_ITEM_PAGE, ['schedule_item']))
        dispatch(initList(LIST_KEY__SCHEDULE_ITEM_LIST))
        dispatch(update_list_filter(LIST_KEY__SCHEDULE_ITEM_LIST, {schedule_id:schedule_id || -1}))
        dispatch(setCurrentDate(LIST_KEY__SCHEDULE_ITEM_LIST, moment()))
        dispatch(ensureSchedulesLoaded([schedule_id]))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = new_props
        if ( new_props.schedule && (!this.props.schedule || new_props.schedule.id !== this.props.schedule.id) ) {
            dispatch(update_list_filter(LIST_KEY__SCHEDULE_ITEM_LIST, {schedule_id:new_props.schedule.id || -1}))
            dispatch(ensureSchedulesLoaded([new_props.schedule_id]))
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, schedule_id, schedule } = props
        const breadcrumbs = [ {to: '/schedule',
                               label: 'Schedules',
                               type: 'schedules'} ]
        if ( schedule && schedule.id ) {
            breadcrumbs.push({to: '/schedule/' + schedule_id,
                              label: schedule.name,
                              type: 'schedule',
                              selected_entities: {schedule: schedule}})
        }
        dispatch(setBreadcrumbs(breadcrumbs))
    }

    onSelectNudge(nudge) {
        const { dispatch } = this.props
        dispatch(setGloballySelectedEntityIds({issue_id: nudge.issue_id,
                                               sprint_id: nudge.sprint_id,
                                               project_id: nudge.project_id}))
    }

    renderLeftPane() {
        const { nudge_header_list } = this.props
        return (
            <div className="list-layout__pane">
              <h3>Things to do</h3>
              <NudgeList list_key={LIST_KEY__NUDGE_LIST}
                         header_list={nudge_header_list}
                         onSelect={this.onSelectNudge}/>
            </div>
        )
    }

    renderRightPane() {
        const { schedule_id, can_edit } = this.props
        return (
            <div className="list-layout__pane">
              <h3>Calendar</h3>
              <PlanningCalendar schedule_id={schedule_id}
                                can_edit={can_edit}
                                list_key={LIST_KEY__SCHEDULE_ITEM_LIST}
              />
            </div>
        )
    }

    render() {
        return (
            <Splitter name="schedule_item_page">
              {this.renderLeftPane()}
              {this.renderRightPane()}
            </Splitter>
        )
    }
}

function mapStateToProps(state, props) {

    const schedule_id = props.match.params.scheduleId
    const schedule = getSchedule(state, schedule_id)
    const nudge_header_list = getNudgeHeaderListForCurrentMien(state)
    const can_edit = canEditScheduleEvents(schedule)

    return {
        schedule_id,
        schedule,
        nudge_header_list,
        can_edit
    }
}

export default withRouter(connect(mapStateToProps)(ScheduleItemPage))

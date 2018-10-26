import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import Splitter from '../components/Splitter'
import {
    LIST_KEY__CALENDAR_EVENT_LIST,
    PAGE_KEY__SCHEDULE_ITEM_PAGE,
    LIST_KEY__NUDGE_LIST,
    LIST_KEY__ISSUE_LIST,
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    setGloballySelectedIssueId,
    setPageFlag,
    getPageFlag
} from '../actions/Page'
import {
    initList,
    update_list_filter,
    getListFilter,
    invalidateList
} from '../actions/ItemList'
import {getSchedule, ensureSchedulesLoaded, canEditScheduleEvents} from '../actions/Schedules'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import NudgeList from '../components/NudgeList'
import PlanningCalendar from '../components/PlanningCalendar'
import IssueList from '../components/IssueList'
import SprintName from '../components/SprintName'
import { convertIssuesToNudges } from '../actions/Nudges'

class ScheduleItemPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectNudge = this.onSelectNudge.bind(this)
        this.onShowMoreIssues = this.onShowMoreIssues.bind(this)
        this.onHideMoreIssues = this.onHideMoreIssues.bind(this)
        this.onSelectIssuesForNudge = this.onSelectIssuesForNudge.bind(this)
    } 
    
    componentDidMount() {
        const {schedule_id, dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__SCHEDULE_ITEM_PAGE, ['schedule_item']))
        dispatch(initList(LIST_KEY__CALENDAR_EVENT_LIST))
        dispatch(ensureSchedulesLoaded([schedule_id]))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = new_props
        if ( (new_props.schedule && (!this.props.schedule || new_props.schedule.id !== this.props.schedule.id)) ||
             (new_props.show_issues_for_nudge && new_props.show_issues_for_nudge !== this.props.show_issues_for_nudge) ) {
            dispatch(ensureSchedulesLoaded([new_props.schedule_id]))
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, schedule_id, schedule, show_issues_for_nudge } = props
        const breadcrumbs = [ {to: '/schedule',
                               label: 'Schedules',
                               type: 'schedules'} ]
        if ( schedule && schedule.id ) {
            breadcrumbs.push({to: '/schedule/' + schedule_id,
                              label: schedule.name,
                              type: 'schedule',
                              selected_entities: {schedule: schedule}})
        }
        if ( show_issues_for_nudge ) {
            dispatch(update_list_filter(LIST_KEY__ISSUE_LIST, {sprint_id:show_issues_for_nudge.sprint_id}))
            dispatch(invalidateList(LIST_KEY__ISSUE_LIST))
        }

        dispatch(setBreadcrumbs(breadcrumbs))
    }

    onShowMoreIssues(nudge) {
        const { dispatch } = this.props
        dispatch(setPageFlag(PAGE_KEY__SCHEDULE_ITEM_PAGE, "show_issues_for_nudge", nudge))
    }

    onHideMoreIssues(evt) {
        const { dispatch } = this.props
        if ( evt ) {
            evt.preventDefault()
        }
        dispatch(setPageFlag(PAGE_KEY__SCHEDULE_ITEM_PAGE, "show_issues_for_nudge", null))
    }

    onSelectNudge(nudge) {
        const { dispatch } = this.props
        dispatch(setGloballySelectedIssueId(nudge.project_id,
                                            nudge.sprint_id,
                                            nudge.issue_id))
    }

    onSelectIssuesForNudge(issue_ids) {
        const { schedule_id, dispatch } = this.props
        if ( ! window.confirm("Add these issues to the nudge list?") ) {
            return
        }
        dispatch(convertIssuesToNudges(schedule_id, issue_ids))
    }

    renderNudgeList() {
        return (
            <div>
              <h3>Projects and sprints that require attention, showing the most important issue for each sprint</h3>
              <NudgeList list_key={LIST_KEY__NUDGE_LIST}
                         onShowMoreIssues={this.onShowMoreIssues}
                         onSelect={this.onSelectNudge}/>
            </div>
        )
    }
    
    renderPlanningCalendar() {
        const { schedule_id, can_edit } = this.props
        return (
            <div>
              <h3>Calendar</h3>
              <PlanningCalendar schedule_id={schedule_id}
                                can_edit={can_edit}
                                list_key={LIST_KEY__CALENDAR_EVENT_LIST}
              />
            </div>
        )
    }

    renderIssuesForNudge(nudge) {
        const { show_issues_for_nudge } = this.props
        return (
            <div>
              <h3>
                Choose issues to nudge from &nbsp;
                <SprintName sprint_id={show_issues_for_nudge.sprint_id}/>
              </h3>
              <button className="button button--primary"
                      onClick={this.onHideMoreIssues}>
                Close
              </button>
              <IssueList list_key={LIST_KEY__ISSUE_LIST}
                         onSelectIssues={this.onSelectIssuesForNudge}
              />
            </div>
        )
    }

    renderLeftPane() {
        const { show_issues_for_nudge } = this.props
        return (
            <div className="list-layout__pane">
              { show_issues_for_nudge === null && this.renderNudgeList() }
              { show_issues_for_nudge !== null && this.renderIssuesForNudge(show_issues_for_nudge) }
            </div>
        )
    }

    renderRightPane() {
        return (
            <div className="list-layout__pane">
              {this.renderPlanningCalendar()}
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
    const can_edit = canEditScheduleEvents(schedule)
    const show_issues_for_nudge = getPageFlag(state, PAGE_KEY__SCHEDULE_ITEM_PAGE, "show_issues_for_nudge") || null
    const nudge_issues_filter = getListFilter(state, LIST_KEY__CALENDAR_EVENT_LIST)

    return {
        schedule_id,
        schedule,
        can_edit,
        show_issues_for_nudge,
        nudge_issues_filter
    }
}

export default withRouter(connect(mapStateToProps)(ScheduleItemPage))

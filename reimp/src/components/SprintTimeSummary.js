import React, {Component} from 'react'
import {connect} from 'react-redux'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {ensureTimeSummaryLoaded, getTimeSummary} from '../actions/TimeSummary'
import { ensureUsersLoaded } from '../actions/Users'
import TimeSummary from './pure/TimeSummary'

class SprintTimeSummary extends Component {

    componentDidMount() {
        this.refresh(this.props)
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(props) {
        const {sprint_id, project_id, time_summary, dispatch} = props
        dispatch(ensureTimeSummaryLoaded(sprint_id))
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureUsersLoaded(time_summary.all_user_ids))
    }

    render() {
        const { time_summary, show_heading, sprint_id } = this.props
        return (
            <TimeSummary time_summary={time_summary}
                         show_heading={show_heading}
                         sprint_id={sprint_id} />
        )
    }
}

function mapStateToProps(state, props) {
    const {sprint_id, project_id, show_heading} = props
    const sprint = getSprint(state, sprint_id) || {}
    const project = getProject(state, project_id) || {}
    const time_summary = getTimeSummary(state, sprint_id) || {}

    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        time_summary: time_summary,
        show_heading: show_heading !== false
    }
}

export default connect(mapStateToProps)(SprintTimeSummary)

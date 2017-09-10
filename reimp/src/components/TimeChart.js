import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { map, keys } from 'lodash'
import OtherUser from './OtherUser'
import SprintTimeSummary from './SprintTimeSummary'
import SprintLink from './SprintLink'
import SprintBreakdown from './SprintBreakdown'
import IssueLink from './IssueLink'
import CurrencyValue from './CurrencyValue'
import UserRate from './UserRate'
import ProgressBar from './ProgressBar'
import Timestamp from './Timestamp'
import Hours from './Hours'
import {
    ensureTimeChartLoaded,
    getTimeChart,
    isLoadingTimeChart,
    invalidateTimeChart
} from '../actions/TimeChart'
import { ensureUsersLoaded } from '../actions/Users'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

class TimeChart extends Component {

    componentDidMount() {
        const { project_id, project, dispatch, project_statement, filter } = this.props
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            dispatch(ensureTimeChartLoaded([project_id], filter))
            dispatch(invalidateTimeChart([project_id], filter))
        }
        this.refresh(project, project_statement)
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, filter } = this.props
        if ( new_props.project_id ) {
            dispatch(ensureProjectsLoaded([new_props.project_id]))
            dispatch(ensureTimeChartLoaded([new_props.project_id], filter))
        }
    }

    render() {

        const { is_loading, time_chart, filter } = this.props
        const that = this;

        return (

            <div>
              This is the time chart
            </div>
            
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id, filter } = props
    const project = getProject(state, project_id) || {}
    const is_loading = isLoadingTimeChart(state, project_id)
    const time_chart = getTimeChart(state, project_id) || {}

    return {
        project_id: project_id,
        project: project,
        time_chart: time_chart,
        is_loading: is_loading,
        filter: filter
    }
}

export default connect(mapStateToProps)(TimeChart)

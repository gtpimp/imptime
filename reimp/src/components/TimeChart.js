import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine} from 'recharts'
import { map, keys, isEqual, isArray } from 'lodash'
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

class TimeChartTooltip extends Component {

    render() {

        const { active, payload, label } = this.props

        if ( ! active ) {
            return null
        }
        
        return (
            <div className="time_chart__tooltip">
              {payload[0].value} hours on  {moment(label).format('dddd DD-MMM-YYYY')}
            </div>
        )
    }
}

class TimeChart extends Component {

    constructor(props) {
        super(props)
        this.xAxisTickFormatter = this.xAxisTickFormatter.bind(this)
    }
    
    componentDidMount() {
        const { project_id, project, dispatch, project_statement, filter } = this.props
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            dispatch(ensureTimeChartLoaded([project_id], filter))

            // Needed because there isn't a single timechart, it depends on the filter
            dispatch(invalidateTimeChart([project_id], filter))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, filter, project_id } = this.props
        if ( new_props.project_id ) {
            dispatch(ensureProjectsLoaded([new_props.project_id]))
            dispatch(ensureTimeChartLoaded([new_props.project_id], filter))
        }
        if ( new_props.filter != filter &&
             isArray(new_props.filter.sprint_ids) &&
             isArray(filter.sprint_ids) &&
             ! isEqual(filter.sprint_ids.sort(), new_props.filter.sprint_ids.sort()) ) {
            dispatch(invalidateTimeChart([project_id], filter))
        }
    }

    xAxisTickFormatter(tickItem) {
        return moment(tickItem).format('DD-MMM')
    }
    
    renderUserChart(user_id, times_for_user) {

        const y_axis_domain = [0, 10]

        return (
            <div className="time_chart__user_chart" key={user_id}>
              <h2 className="time_chart__user_chart_title">
                <OtherUser user_id={user_id} />
              </h2>
              <BarChart width={500} height={100} data={times_for_user}>
                <Bar dataKey='daily_hours' fill="#8884d8"/>
                <XAxis dataKey="started_on"
                       tickFormatter={this.xAxisTickFormatter}/>
                <YAxis domain={y_axis_domain}
                       minTickGap={1}
                       interval={1}
                       hide={true}
                       allowDataOverflow={true}/>
                <ReferenceLine y={8} label="" stroke="orange"/>
                <Tooltip content={<TimeChartTooltip/>}/>
              </BarChart>
            </div>
        )
    }

    render() {

        const { is_loading, time_chart, filter } = this.props
        const that = this;

        return (

            <div>
              { map(keys(time_chart.times_by_user),
                    function(user_id) {
                        const times_for_user = time_chart.times_by_user[user_id]
                        return that.renderUserChart(user_id, times_for_user)
                    })
              }
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

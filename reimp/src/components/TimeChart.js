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
    
    xAxisTickFormatter(tickItem) {
        return moment(tickItem).format('DD-MMM')
    }
    
    render() {

        const { times, xaxis_datakey, yaxis_datakey } = this.props
        const y_axis_domain = [0, 10]

        return (
            <div className="time_chart">
              <BarChart width={500} height={100} data={times}>
                <Bar dataKey={yaxis_datakey} fill="#8884d8"/>
                <XAxis dataKey={xaxis_datakey}
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

}

function mapStateToProps(state, props) {
    const { times, xaxis_datakey, yaxis_datakey } = props
    
    return {
        times,
        xaxis_datakey,
        yaxis_datakey
    }
}

export default connect(mapStateToProps)(TimeChart)

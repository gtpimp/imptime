import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import {
    BarChart, ComposedChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ReferenceLine, Scatter, ReferenceArea, Rectangle
} from 'recharts'
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
import moment from 'moment';

class TimeChartTooltip extends Component {

    render() {

        const { active, payload, label } = this.props

        if ( ! active || ! payload ) {
            return null
        }
        
        return (
            <div className="time_chart__tooltip">
              { map(payload, (series) =>
                  (
                      <div key={series.dataKey+"_"+label+"_"+name} className="time_chart__tooltip_series">
                        { series.dataKey == 'graph_y' &&
                          <div>{series.value} hours on {moment(label).format('dddd DD-MMM-YYYY')}</div>
                        }
                        { series.dataKey == 'daily_hours' &&
                          <div>{series.value} hours on {moment(label).format('dddd DD-MMM-YYYY')}</div>
                        }
                        { series.dataKey == 'sick_days' && series.value > 0 &&
                          <div>Sick day</div>
                        }
                        { series.dataKey == 'leave_days' && series.value > 0 &&
                          <div>Leave</div>
                        }
                        { series.dataKey == 'office_closed' && series.value > 0 &&
                          <div>Office closed</div>
                        }
                        { series.dataKey == 'public_holidays' && series.value > 0 &&
                          <div>Public holiday</div>
                        }
                      </div>
                  )
              )}
              
            </div>
        )
    }
}

class TimeChart extends Component {

    constructor(props) {
        super(props)
        this.xAxisTickFormatter = this.xAxisTickFormatter.bind(this)
        this.customBar = this.customBar.bind(this)
    }
    
    xAxisTickFormatter(tickItem) {
        return moment(tickItem).format('DD-MMM')
    }

    customBar(bar_props) {
        return <Rectangle {...bar_props}
                          className={classNames("recharts-bar-rectangle",
                                                {"recharts-bar-rectangle--leave-day": bar_props.leave_days>0,
                                                 "recharts-bar-rectangle--sick-day": bar_props.sick_days>0,
                                                 "recharts-bar-rectangle--office-closed": bar_props.office_closed>0,
                                                 "recharts-bar-rectangle--public-holiday": bar_props.public_holidays>0})} />
    }
    
    render() {

        const { times, xaxis_datakey, yaxis_datakey, width, height,
                reference_line_hours, public_holidays, sick_days, leave_days,
                office_closed, average_hours_worked, average_hours_worked_warning_threshold,
                show_y_axis } = this.props
        const y_axis_domain = [0, 10]

        const is_bad = average_hours_worked_warning_threshold && average_hours_worked < average_hours_worked_warning_threshold
        const is_good = average_hours_worked_warning_threshold && average_hours_worked >= average_hours_worked_warning_threshold
        
        return (
            <div className={classNames("time_chart",
                                       {"time_chart--bad":is_bad,
                                        "time_chart--good":is_good})} >
              <ComposedChart width={width} height={height} data={times}>
                <Bar dataKey={yaxis_datakey} fill="#8884d8" shape={this.customBar}/>
                <XAxis dataKey={xaxis_datakey}
                       tickFormatter={this.xAxisTickFormatter}/>
                <YAxis domain={y_axis_domain}
                       minTickGap={1}
                       interval={1}
                       ticks={[1,2,3,4,5,6,7,8]}
                       hide={show_y_axis!==true}
                       allowDataOverflow={true}/>
                { reference_line_hours > 0 && 
                  <ReferenceLine y={reference_line_hours} label="" stroke="orange"/>
                }
                { is_bad &&
                  <ReferenceLine y={average_hours_worked || 0.1} stroke="red" stokeWidth={5}/>
                }
                { is_good &&
                  <ReferenceLine y={average_hours_worked} stroke="blue"/>
                }
                { sick_days &&
                  <Scatter dataKey={'sick_days'} shape='triangle'/>
                }
                { leave_days &&
                  <Scatter dataKey={'leave_days'} shape='square'/>
                }
                { office_closed &&
                  <Scatter dataKey={'office_closed'} shape='cross'/>
                }
                { public_holidays &&
                  <Scatter dataKey={'public_holidays'} shape='cross'/>
                }
                <Tooltip content={<TimeChartTooltip/>}/>
              </ComposedChart>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { times, xaxis_datakey, yaxis_datakey, width, height } = props
    let { reference_line_hours } = props
    if ( reference_line_hours === undefined ) {
        reference_line_hours = 8
    }
    return {
        times,
        xaxis_datakey,
        yaxis_datakey,
        width: width || 500,
        height: height || 100,
        reference_line_hours: reference_line_hours
    }
}

export default connect(mapStateToProps)(TimeChart)

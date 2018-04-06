import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { map, keys, isEqual, isArray } from 'lodash'
import OtherUser from './OtherUser'
import TimeChart from './TimeChart'
import {
    ensureTimeChartLoaded,
    getTimeChart,
    isLoadingTimeChart,
    invalidateTimeChart
} from '../actions/TimeChart'

class SprintTimeChartByUser extends Component {

    componentDidMount() {
        const { project_id, dispatch, filter } = this.props
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            dispatch(ensureTimeChartLoaded([project_id], filter))

            // Needed because there isn't a single timechart, it depends on the filter
            dispatch(invalidateTimeChart(project_id, filter))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, filter, project_id } = this.props
        if ( new_props.project_id ) {
            dispatch(ensureProjectsLoaded([new_props.project_id]))
            dispatch(ensureTimeChartLoaded([new_props.project_id], filter))
        }
        if ( new_props.filter !== filter &&
             isArray(new_props.filter.sprint_ids) &&
             isArray(filter.sprint_ids) &&
             ! isEqual(filter.sprint_ids.sort(), new_props.filter.sprint_ids.sort()) ) {
            dispatch(invalidateTimeChart([project_id], filter))
        }
    }

    render() {

        const { time_chart } = this.props

        return (

            <div>
              { map(keys(time_chart.times_by_user),
                    function(user_id) {
                        const times_for_user = time_chart.times_by_user[user_id]
                        return (
                            <div className="time_chart__user_chart" key={user_id}>
                              <h2 className="time_chart__user_chart_title">
                                <OtherUser user_id={user_id} />
                              </h2>
                              <TimeChart times={times_for_user}
                                         yaxis_datakey="daily_hours"
                                         xaxis_datakey="started_on"/>
                            </div>
                        )
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

export default connect(mapStateToProps)(SprintTimeChartByUser)

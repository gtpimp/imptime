import React, { Component } from 'react'
import { connect } from 'react-redux'
import {withRouter} from 'react-router-dom'
import classNames from 'classnames'
import {
    ensureSchedulesLoaded,
    getSchedule
} from '../actions/Schedules'

import IssueName from './IssueName'
import SprintName from './SprintName'
import ProjectName from './ProjectName'
import Timestamp from './Timestamp'

// from https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function shadeColor2(color, percent) {   
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=(f>>8)&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

var stringToColour = function(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
    colour = shadeColor2(colour, 0.7)
    return colour;
}


class Schedule extends Component {

    constructor(props) {
        super(props)
        this.onClickSchedule = this.onClickSchedule.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, schedule_id } = this.props
	dispatch(ensureSchedulesLoaded([schedule_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, schedule_id } = new_props
	dispatch(ensureSchedulesLoaded([schedule_id]))
    }

    onClickSchedule() {
        const { history, schedule } = this.props
        history.push('/projects/' + schedule.project_id + '/sprints/' + schedule.sprint_id + '/issues/' + schedule.issue_id);
    }

    render() {

        const { schedule } = this.props

        const reason_class_name = "schedule__reason--" + schedule.reason

        if ( ! schedule.id ) {
            return null
        }
        
        return (
            <div className="schedule" onClick={this.onClickSchedule}>
              <div className="schedule__title">
                <div style={{"backgroundColor":stringToColour(schedule.project_id+schedule.sprint_id)}}
                     className={classNames("schedule__reason", reason_class_name)}>

                  <div className="schedule__project">
                    <ProjectName project_id={schedule.project_id} />
                  </div>
                  <div className="schedule__sprint">
                    <SprintName sprint_id={schedule.sprint_id} display_mode={["status", "type"]} />
                  </div>
                  
                </div>
              </div>
              <div className="schedule__content">
                <div className="schedule__header">
                  {schedule.reason.replace(/_/g, " ")}
                </div>
                <div className="schedule__issue">
                  <IssueName issue_id={schedule.issue_id} />
                </div>
                <div className="schedule__footer">
                  { schedule.due_date_reason &&
                    <div className="schedule__due_date">
                      <div>
                        {schedule.due_date_reason}
                      </div>
                      <div className="schedule__due_date__date">
                        { schedule.due_date && <Timestamp value={schedule.due_date} format="from_now" /> }
                        { !schedule.due_date && <div>never</div> }
                      </div>
                    </div>
                  }
                  <div className="schedule__description">
                    <div>
                      {schedule.description}
                    </div>
                    <div className="schedule__modified">
                      as of <Timestamp value={schedule.modified} format="from_now" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { schedule_id } = props
    const schedule = getSchedule(state, schedule_id) || {}

    return {
        schedule,
        is_loading: !schedule.id
    }
}

export default withRouter(connect(mapStateToProps)(Schedule))

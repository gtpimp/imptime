import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import {browserHistory} from 'react-router'
import classNames from 'classnames'
import {
    ensureNudgesLoaded,
    getNudge
} from '../actions/Nudges'

import { isLoadingItems } from '../actions/Item'
import Nudge from './Nudge'
import IssueName from './IssueName'
import SprintName from './SprintName'
import ProjectName from './ProjectName'
import Timestamp from './Timestamp'

// from https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function shadeColor2(color, percent) {   
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

var stringToColour = function(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  colour = shadeColor2(colour, 0.7)
  return colour;
}


class NudgeList extends Component {

    constructor(props) {
        super(props)
        this.onClickNudge = this.onClickNudge.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, nudge_id } = this.props
	dispatch(ensureNudgesLoaded([nudge_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, nudge_id } = new_props
	dispatch(ensureNudgesLoaded([nudge_id]))
    }

    onClickNudge() {
        const { dispatch, nudge } = this.props
        browserHistory.push('/projects/' + nudge.project_id + '/sprints/' + nudge.sprint_id + '/issues/' + nudge.issue_id);
    }

    render() {

        const { nudge, is_loading } = this.props
        const that = this

        const reason_class_name = "nudge__reason--" + nudge.reason

        return (
            <div className="nudge" onClick={this.onClickNudge}>
              <div className="nudge__title">
                <div style={{"background-color":stringToColour(nudge.reason)}}
                     className={classNames("nudge__reason", reason_class_name)}>
                  {nudge.reason.replace(/_/g, " ")}
                </div>
              </div>
              <div className="nudge__content">
                <div className="nudge__header">
                  <div className="nudge__project">
                    <ProjectName project_id={nudge.project_id} />
                  </div>
                  <div className="nudge__sprint">
                    <SprintName sprint_id={nudge.sprint_id} display_mode={["status", "type"]} />
                  </div>
                </div>
                <div className="nudge__issue">
                  <IssueName issue_id={nudge.issue_id} />
                </div>
                <div className="nudge__footer">
                  <div className="nudge__description">
                    {nudge.description}
                  </div>
                  <div className="nudge__modified">
                    as of <Timestamp value={nudge.modified} format="from_now" />
                  </div>
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { nudge_id } = props
    const nudge = getNudge(state, nudge_id)

    return {
        nudge,
        is_loading: !nudge.id
    }
}

export default connect(mapStateToProps)(NudgeList)

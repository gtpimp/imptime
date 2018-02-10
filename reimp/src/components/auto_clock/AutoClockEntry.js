import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import classNames from 'classnames'
import '../../sass/auto-clock.scss'
import moment from 'moment'
import { getAutoClock, ensureAutoClocksLoaded } from '../../actions/AutoClock'
import Timestamp from '../Timestamp'
import Hours from '../Hours'
import ProjectName from '../ProjectName'
import SprintName from '../SprintName'
import IssueName from '../IssueName'

class AutoClockEntry extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { entry_id, dispatch } = props
        dispatch(ensureAutoClocksLoaded([entry_id]))
    }

    render() {
        const { entry } = this.props

        let hours = entry.hours
        let end_time = entry.end_time
        let icon_class = "icon--timer-inactive"
        if ( entry.is_active ) {
            end_time = moment()
            hours = end_time.diff(moment(entry.start_time), 'hours', true)
            icon_class = "icon--timer-active"
        }
        
        return (
            <div className="auto-clock-entry">
              <div className="auto-clock-entry__times">
                
                <div className={icon_class}/>
                  
                <div className="auto-clock-entry__field auto-clock-entry__start-time">
                  <Timestamp format="short-time" value={entry.start_time} />
                </div>

                <div className="auto-clock-entry__field auto-clock-entry__time-separator">
                  ->
                </div>
                
                <div className="auto-clock-entry__field auto-clock-entry__end-time">
                  <Timestamp format="short-time" value={end_time} />
                </div>

                <div className="auto-clock-entry__field auto-clock-entry__hours">
                  <Hours hours={hours} />
                </div>
                  
              </div>
              <div className="auto-clock-entry__role">
                {entry.role}
              </div>
              <div className="auto-clock-entry__description">
                {entry.comments}
              </div>
              <div className="auto-clock-entry__entities">
                <div className="auto-clock-entry__label">
                  Project:
                </div>
                <div className="auto-clock-entry__field auto-clock-entry__project_name">
                  <ProjectName project_id={entry.project_id} />
                </div>
                <div className="auto-clock-entry__label">
                  Sprint:
                </div>
                <div className="auto-clock-entry__field auto-clock-entry__sprint_name">
                  <SprintName sprint_id={entry.sprint_id} />
                </div>
                <div className="auto-clock-entry__label">
                  Issue:
                </div>
                <div className="auto-clock-entry__field auto-clock-entry__issue_name">
                  <IssueName issue_id={entry.issue_id} />
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { entry_id  } = props
    const entry = getAutoClock(state, entry_id) || {}
    return {
        entry_id,
        entry
    }

}

export default connect(mapStateToProps)(AutoClockEntry)

import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import '../../sass/auto-clock.scss'
import moment from 'moment'
import { getAutoClock, ensureAutoClocksLoaded } from '../../actions/AutoClock'
import Timestamp from '../Timestamp'
import Hours from '../Hours'
import AutoClockEntity from './AutoClockEntity'

class AutoClockEntry extends Component {

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
        const { entry, time_format } = this.props

        let hours = entry.hours
        let end_time = entry.end_time
        if ( entry && entry.is_active ) {
            end_time = moment()
            hours = end_time.diff(moment(entry.start_time), 'hours', true)
        }
        
        return (
            <div className={classNames("auto-clock-entry", "entry__"+entry.id)}>

              <div className="auto-clock-entry__times">

                <div className="auto-clock-entry__label">
                  Time: 
                </div>
                
                <div className="auto-clock-entry__field auto-clock-entry__start-time">
                  <Timestamp format={time_format} value={entry.start_time} />
                </div>

                <div className="auto-clock-entry__field auto-clock-entry__time-separator">
                  ->
                </div>
                
                <div className="auto-clock-entry__field auto-clock-entry__end-time">
                  <Timestamp format={time_format} value={end_time} />
                </div>
              </div>

              <div className="auto-clock-entry__hours">
                <div className="auto-clock-entry__label">
                  Duration:
                </div>
                <div className="auto-clock-entry__field auto-clock-entry__hours">
                  <Hours hours={hours} />
                </div>
                <div className="auto-clock-entry__label">
                   hours
                </div>
              </div>
              <div className="auto-clock-entry__role">
                <div className="auto-clock-entry__label">
                  Role:
                </div>
                <div className="auto-clock-entry__field">
                  {entry.role_name}
                </div>
              </div>
              { entry.comments && 
                <div className="auto-clock-entry__description">
                  <div className="auto-clock-entry__label">
                    Comment:
                  </div>
                  {entry.comments}
                </div>
              }
              <AutoClockEntity project_id={entry.project_id}
                               sprint_id={entry.sprint_id}
                               issue_id={entry.issue_id} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { entry_id, time_format } = props
    const entry = getAutoClock(state, entry_id) || {}
    return {
        entry_id,
        entry,
        time_format: time_format || "short-time"
    }

}

export default connect(mapStateToProps)(AutoClockEntry)

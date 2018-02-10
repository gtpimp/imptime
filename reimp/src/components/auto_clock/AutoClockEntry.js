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
import AutoClockEntity from './AutoClockEntity'

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
                {entry.role_name}
              </div>
              <div className="auto-clock-entry__description">
                {entry.comments}
              </div>
              <AutoClockEntity project_id={entry.project_id}
                               sprint_id={entry.sprint_id}
                               issue_id={entry.issue_id} />
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

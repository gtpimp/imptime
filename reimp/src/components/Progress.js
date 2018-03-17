import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import Duration from '../components/Duration'
import TimeProgressBar from './TimeProgressBar'
import { format_hours } from '../actions/lib'

class Progress extends Component {
    
    render() {
        const {issue, estimate, hours, force_show} = this.props
        const current = format_hours(hours)
        const max = format_hours(estimate)

        const show = force_show || hours > 0 || estimate > 0
        
        return (
            <div className="progress">
              { show && 
                <div className="progress__component progress__component--progress">
                  <div className="progress__time">
                    <div className={classNames('progress__time', 'progress__time--' + ( current <= max ? 'progress' : 'over'))}>
                      <Duration value={current}/>
                    </div>
                    <div className="progress__time-separator">/</div>
                    <div className="progress__time progress__time--max">
                      <Duration value={max}/>
                    </div>
                  </div>
                  <div className="progress__progress_bar">
                    <TimeProgressBar current={current} max={max}/>
                  </div>
                </div>
              }
                
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue, estimate, actual, force_show } = props

    let hours = actual
    if ( hours === undefined ) {
        hours = issue.actual_hours
    }
    
    return {
        issue,
        hours,
        force_show,
        estimate: estimate || 0
    }
}

export default connect(mapStateToProps)(Progress)

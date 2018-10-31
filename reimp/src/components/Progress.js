import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import Duration from '../components/Duration'
import TimeProgressBar from './TimeProgressBar'
import ProgressBar from './ProgressBar'
import { format_hours } from '../actions/lib'

class Progress extends Component {
    
    render() {
        const {estimate, hours, force_show} = this.props
        let current = format_hours(hours)
        let max = format_hours(estimate)

        if ( force_show ) {
            if ( hours === null && estimate === null ) {
                return (
                    <div className="progress">
                      <div className="progress__component progress__component--progress">
                        <ProgressBar current={null} max={null} />
                      </div>
                    </div>
                )
            }
        }
        
        let max_valid = estimate !== undefined && estimate > 0
        let current_valid = hours !== undefined && hours > 0

        
        const show = force_show || hours > 0 || estimate > 0

        return (
            <div className="progress">
              { show && 
                <div className="progress__component progress__component--progress">
                  <div className="progress__time">
                    { current_valid && 
                      <div className={classNames('progress__time',
                                                 {'progress__time--progress': max_valid && current<=max,
                                                  'progress__time--over': max_valid && current>max,
                                                  'progress__time--no-estimate': !max_valid})}>
                        <Duration value={current}/>
                      </div>
                    }
                    { max_valid && <div className="progress__time-separator">/</div> }
                    { max_valid && 
                      <div className="progress__time progress__time--max">
                        <Duration value={max}/>
                      </div>
                    }
                  </div>
                  <div className="progress__progress_bar">
                    { max_valid && 
                      <TimeProgressBar current={current} max={max}/>
                    }
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
        hours,
        force_show,
        estimate: estimate
    }
}

export default connect(mapStateToProps)(Progress)

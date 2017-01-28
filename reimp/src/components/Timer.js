import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { format_hours } from '../actions/lib'

class Timer extends Component {

    constructor(props) {
        super(props)
    }


    render() {

        const { hours, active, onStart, onStop } = this.props

        const duration = format_hours(hours)
        
        return (
            <div className="timer">
                <div className="timer__component timer__component--controls">
                { active &&
                  <button className="button button--default button--timer button--stop-timer"  onClick={onStop}>
                      <div className="button__icon">
                          <i className="material-icons">access_time</i>
                      </div>
                      <div className="button__text">
                          Stop
                      </div>
                  </button>
                }
                { !active &&
                  <button className="button button--default button--timer button--start-timer"  onClick={onStart}>
                      <div className="button__icon">
                          <i className="material-icons">access_time</i>
                      </div>
                      <div className="button__text">
                          Start
                      </div>
                  </button>
                }
                </div>
                <div className="timer__component timer__component--time">
                    <div className={classNames('timer__time', 'timer__time--' + (active ? 'active' : 'inactive'))}>{duration}</div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { hours, active } = props
    
    return {
        hours: hours,
        active: active
    }
}


export default connect(mapStateToProps)(Timer)

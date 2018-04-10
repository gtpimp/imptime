import React, {Component} from 'react'
import {connect} from 'react-redux'

class TimerSwitch extends Component {

    render() {

        const {active, onStart, onStop} = this.props

        return (
            <div className="timer-switch">
                { active &&
                <button className="button button--default button--timer button--stop-timer" onClick={onStop}>
                    <div className="button__icon">
                        <i className="material-icons timer-switch__icon">access_time</i>
                    </div>
                    <div className="button__text">
                        Stop
                    </div>
                </button>
                }
                { !active &&
                <button className="button button--default button--timer button--start-timer" onClick={onStart}>
                    <div className="button__icon">
                        <i className="material-icons">access_time</i>
                    </div>
                    <div className="button__text">
                        Start
                    </div>
                </button>
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const {active} = props

    return {
        active: active
    }
}


export default connect(mapStateToProps)(TimerSwitch)

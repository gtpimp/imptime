import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'

class Timer extends Component {

    constructor(props) {
        super(props)
    }


    render() {
        const active = Math.floor((Math.random() * 10) + 1) % 2 === 0
        return (
            <div className="timer">
                <div className="timer__component timer__component--controls">
                { active &&
                <button className="button button--timer button--stop-timer">
                    <div className="button__icon">
                        <i className="material-icons">access_time</i>
                    </div>
                    <div className="button__text">
                        Stop
                    </div>
                </button>
                }
                { !active &&
                <button className="button button--timer button--start-timer">
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
                    <div className={classNames('timer__time', 'timer__time--' + (active ? 'active' : 'inactive'))}>0{Math.floor((Math.random() * 9) + 1)}:{Math.floor((Math.random() * 49)+ 10)}</div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(Timer)

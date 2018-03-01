import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import ProgressBar from './ProgressBar'

class TimeProgressBar extends Component {

    render() {
        const {currentTime, maxTime} = this.props
        return (
            <ProgressBar current={currentTime} max={maxTime} />
        )
    }
}

function timeToNumber(time) {
    if (time === "00:00") {
        return 0
    }
    time = time.replace(/^0+/, '')
    var timeNumRep = time.split(/[.:]/)
    var hours = Number(timeNumRep[0])
    var mins = Math.round((Number(timeNumRep[1]) / 60) * 100) / 100
    var timeValue = hours + mins
    return timeValue
}

function mapStateToProps(state, props) {

    return {
        currentTime: timeToNumber(props.current),
        maxTime: timeToNumber(props.max)
    }
}

export default connect(mapStateToProps)(TimeProgressBar)

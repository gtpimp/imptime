import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import {format_hours} from '../actions/lib'

class ElapsedTime extends Component {

    render() {

        const {hours, active} = this.props

        const duration = format_hours(hours)

        return (
            <div className="elapsed-time">
                <div className={classNames('timer__time', 'timer__time--' + (active ? 'active' : 'inactive'))}>{duration}</div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const {hours, active} = props

    return {
        hours: hours,
        active: active
    }
}


export default connect(mapStateToProps)(ElapsedTime)

import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { convert_hours_to_parts, format_hours } from '../actions/lib'

class Hours extends Component {

    render() {

        const {decimal_hours, formatted_hours, tooltip} = this.props

        return (
            <div className={classNames("hours",
                                       {"hours--negative" :decimal_hours<0})}
                 data-tip={tooltip}
            >
              {formatted_hours}
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const decimal_hours = props.hours
    const fixed_hours = decimal_hours || 0

    const time_parts = convert_hours_to_parts(fixed_hours)
    const {hours, minutes, seconds} = time_parts
    const formatted_hours = format_hours(hours, time_parts)
    const tooltip = "" + hours + "hours:" + minutes + "minutes:" + seconds + "seconds. " +
                    "  As decimal: " + decimal_hours + " hours"
    
    return {
        decimal_hours: fixed_hours,
        formatted_hours,
        tooltip
    }
}

export default connect(mapStateToProps)(Hours)

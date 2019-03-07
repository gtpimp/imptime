import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { convert_hours_to_parts, format_hours } from '../actions/lib'

class Hours extends Component {

    constructor(props) {
        super(props)
        this.state = {show_hint: false}
        this.showHint = this.showHint.bind(this)
        this.hideHint = this.hideHint.bind(this)
    }

    showHint() {
        this.setState({show_hint: true})
    }
    
    hideHint() {
        this.setState({show_hint: false})
    }
    
    render() {

        const {formatted_hours, hours, minutes, decimal_hours} = this.props
        const {show_hint} = this.state

        return (
            <div className={classNames("hours",
                                       {"hours--negative" :decimal_hours<0})}
                 onMouseOver={this.showHint}
                 onMouseLeave={this.hideHint}
            >
              {formatted_hours}

              { show_hint &&
                <div className="hours__hint">
                  <div>{hours} hours : {minutes} minutes</div>
                  <div>As decimal: {decimal_hours} hours</div>
                </div>
              }
              
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { show_seconds } = props
    
    const decimal_hours = props.hours
    const fixed_hours = decimal_hours || 0

    let time_parts = convert_hours_to_parts(fixed_hours)
    const {hours, minutes, seconds} = time_parts

    const formatted_hours = format_hours(hours, time_parts, show_seconds)
    
    return {
        decimal_hours: fixed_hours,
        hours,
        minutes,
        seconds,
        formatted_hours
    }
}

export default connect(mapStateToProps)(Hours)

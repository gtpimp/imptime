import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { format_hours } from '../actions/lib'

class Hours extends Component {

    render() {

        const {hours} = this.props

        const formatted_hours = format_hours(hours)

        return (
            <div className={classNames("hours",
                                       {"hours--negative" :hours<0})}>
              {formatted_hours}
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const {hours} = props
    const fixed_hours = hours || 0
    return {
        hours: fixed_hours
    }
}

export default connect(mapStateToProps)(Hours)

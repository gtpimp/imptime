import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'

class Hours extends Component {

    render() {

        const {hours} = this.props

        return (
            <div className="elapsed-time">{hours} hours</div>
        )
    }
}

function mapStateToProps(state, props) {

    const {hours} = props

    return {
        hours: hours
    }
}

export default connect(mapStateToProps)(Hours)

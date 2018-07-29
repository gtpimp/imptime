import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import AutoClockList from '../components/auto_clock/AutoClockList'
import {
    LIST_KEY__CLOCK_HISTORY_LIST,
} from '../actions/ItemListKeyRegistry'

class ClockHistoryPage extends Component {

    render() {
        const { list_key} = this.props
        return (
            <div className="list-layout__list">
              <AutoClockList list_key={list_key} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {
        list_key: LIST_KEY__CLOCK_HISTORY_LIST,
    }
}

export default withRouter(connect(mapStateToProps)(ClockHistoryPage))

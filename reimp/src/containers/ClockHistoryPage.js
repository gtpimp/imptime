import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import AutoClockList from '../components/auto_clock/AutoClockList'
import {
    LIST_KEY__CLOCK_HISTORY_LIST,
} from '../actions/ItemListKeyRegistry'

class ClockHistoryPage extends Component {

    render() {
        const { list_key, filter_unallocated, filter_issue_id } = this.props
        return (
            <div className="list-layout__list">
              <AutoClockList list_key={list_key}
                             filter_unallocated={filter_unallocated}
                             filter_issue_id={filter_issue_id} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { filter } = props.match.params
    const { issueId } = props.match.params

    const filter_unallocated = filter === "unallocated"
    const filter_issue_id = issueId || undefined
    
    return {
        list_key: LIST_KEY__CLOCK_HISTORY_LIST,
        filter_unallocated,
        filter_issue_id
    }
}

export default withRouter(connect(mapStateToProps)(ClockHistoryPage))

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import BillableHoursStatement from '../components/BillableHoursStatement'

class BillableHoursStatementPage extends Component {

    render() {
        return (
            <div>
              <h2>
                Statement of billable hours
              </h2>
              <BillableHoursStatement />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
    }
}

export default withRouter(connect(mapStateToProps)(BillableHoursStatementPage))

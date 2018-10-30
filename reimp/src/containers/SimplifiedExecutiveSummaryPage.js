import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import ExecutiveSummary from '../components/ExecutiveSummary'

class SimplifiedExecutiveSummaryPage extends Component {   
    render() {
        return (
            <ExecutiveSummary />
        )
    }
}
function mapStateToProps(state, props) {
    return {}
}
export default withRouter(connect(mapStateToProps)(SimplifiedExecutiveSummaryPage))

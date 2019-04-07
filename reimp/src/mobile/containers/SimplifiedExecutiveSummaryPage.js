import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import ExecutiveSummary from '../components/ExecutiveSummary'
import SimplifiedPage from './SimplifiedPage'

class SimplifiedExecutiveSummaryPage extends Component {
    render() {
        const { project_id, sprint_id } = this.props
        return (
            <SimplifiedPage>
              <ExecutiveSummary project_id={ project_id } sprint_id={ sprint_id } />
            </SimplifiedPage>
        )
    }
}
function mapStateToProps(state, props) {
    const sprint_id = props.match.params.sprintId
    const project_id = props.match.params.projectId
    return {
        sprint_id: sprint_id,
        project_id: project_id
    }
}
export default withRouter(connect(mapStateToProps)(SimplifiedExecutiveSummaryPage))

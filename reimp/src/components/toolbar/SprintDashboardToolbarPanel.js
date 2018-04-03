import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import '../../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'
import ReactTooltip from 'react-tooltip'
import {
    PAGE_KEY__SPRINT_DASHBOARD_PAGE
} from '../../actions/ItemListKeyRegistry'
import { has_permission } from '../../actions/Users'

class SprintDashboardToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onDeleteSprintClick = this.onDeleteSprintClick.bind(this)
        this.navigateToIssuesPage = this.navigateToIssuesPage.bind(this)
        this.navigateToCostSummaryPage = this.navigateToCostSummaryPage.bind(this)
    }

    onDeleteSprintClick() {
        alert("Deleting of sprints not available yet")
    }

    navigateToIssuesPage() {
        const { history, project_id, sprint_id } = this.props
        history.push('/projects/'+project_id+'/sprints/'+sprint_id+'/issues');
    }

    navigateToCostSummaryPage() {
        const { history, project_id, sprint_id } = this.props
        history.push('/projects/'+project_id+'/sprints/'+sprint_id+'/costSummary');
    }

    render() {
        const { sprint_id, has_view_ctc_billable_rates_permission } = this.props
        return (
            <div className="toolbar-panel">
                  <button className="button button--large button--primary" onClick={this.navigateToIssuesPage}>
                    Issues
                  </button>
                  { has_view_ctc_billable_rates_permission &&
                    <div>
                      <button className="button button--large button--primary" onClick={this.navigateToCostSummaryPage}>
                        Cost Summary
                      </button>
                    </div>
                  }
              <ToolbarButton tooltip="Delete" icon="delete" onClick={this.onDeleteSprintClick}/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const sprint_objs = (state.sprint || {}).items_by_id || {}
    const page = state.page || {}
    const selected_sprint_ids = (page[PAGE_KEY__SPRINT_DASHBOARD_PAGE] || {}).sprint_ids || []
    const sprint = (selected_sprint_ids.length > 0 && sprint_objs[selected_sprint_ids[0]]) || {}
    const sprint_id = sprint.id || null
    const project_id = sprint.project_id || null
    const has_view_ctc_billable_rates_permission = has_permission(state, project_id, 'has_view_ctc_billable_rates')

    return {
        sprint,
        sprint_id,
        project_id,
        has_view_ctc_billable_rates_permission
    }
}


export default withRouter(connect(mapStateToProps)(SprintDashboardToolbarPanel))

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import '../../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'
import {
    PAGE_KEY__SPRINT_PROPOSAL_PAGE
} from '../../actions/ItemListKeyRegistry'
import { has_permission } from '../../actions/Users'

class SprintProposalToolbarPanel extends Component {

    render() {
        const { has_view_ctc_billable_rates_permission } = this.props
        return (
            <div className="toolbar-panel">
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const sprint_objs = (state.sprint || {}).items_by_id || {}
    const page = state.page || {}
    const selected_sprint_ids = (page[PAGE_KEY__SPRINT_PROPOSAL_PAGE] || {}).sprint_ids || []
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


export default withRouter(connect(mapStateToProps)(SprintProposalToolbarPanel))

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import '../../sass/toolbar-panel.css'
import {
    PAGE_KEY__SPRINT_PROPOSAL_PAGE
} from '../../actions/ItemListKeyRegistry'

class SprintProposalToolbarPanel extends Component {

    render() {
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

    return {
        sprint,
        sprint_id,
        project_id
    }
}


export default withRouter(connect(mapStateToProps)(SprintProposalToolbarPanel))

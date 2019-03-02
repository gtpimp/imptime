import React, {Component} from 'react'
import {connect} from 'react-redux'
import { cx, css } from 'emotion'
import {withRouter} from 'react-router-dom'
import '../../sass/toolbar-panel.css'
import {
    PAGE_KEY__SPRINT_PROPOSAL_PAGE
} from '../../actions/ItemListKeyRegistry'
import { getPageSelectedEntities } from '../../actions/Page'
import { printCurrentPage } from '../../actions/Print'
import { getSprint } from '../../actions/Sprints'

class SprintProposalToolbarPanel extends Component {

    onPrint = (evt) => {
        const { dispatch, sprint } = this.props
        evt.preventDefault()
        dispatch(printCurrentPage(`Proposal_${sprint.name}`))
    }
    
    render() {
        return (
            <div className="toolbar-panel">
              <div className={cx("icon--print", css`cursor:pointer`)}
                   onClick={this.onPrint} 
              />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const page_key = PAGE_KEY__SPRINT_PROPOSAL_PAGE
    const selected_sprint_ids = getPageSelectedEntities(state, page_key).sprint_ids
    const sprint_id = selected_sprint_ids && selected_sprint_ids[0]
    const sprint = getSprint(state, sprint_id)
    const project_id = sprint && sprint.project_id
    
    return {
        page_key,
        sprint,
        sprint_id,
        project_id
    }
}


export default withRouter(connect(mapStateToProps)(SprintProposalToolbarPanel))

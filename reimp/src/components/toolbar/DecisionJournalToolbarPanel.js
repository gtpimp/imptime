import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { startCandidateDecisionJournal } from '../../actions/DecisionJournals'
import { getGloballySelectedProjectId } from '../../actions/Page'
import { has_permission } from '../../actions/Users'

class DecisionJournalsToolbarPanel extends Component {

    onNewDecisionJournalClick = () => {
        const { dispatch, project_id } = this.props
        dispatch(startCandidateDecisionJournal(project_id))
    }

    render() {
        const { can_add } = this.props
        return (
            <div className="toolbar-panel">
              { can_add && 
                <div className="button toolbar-button--small button--large button--primary"
                     onClick={this.onNewDecisionJournalClick}>
                  + New Journal Entry
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = getGloballySelectedProjectId(state)
    const can_add = has_permission(state, project_id, 'has_edit_decision_journal')
    
    return {
        project_id,
        can_add
    }
}

export default withRouter(connect(mapStateToProps)(DecisionJournalsToolbarPanel))

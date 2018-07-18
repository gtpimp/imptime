import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getSprint } from '../actions/Sprints'
import Pluralize from 'react-pluralize'
import { has_permission } from '../actions/Users'

class SprintStateSummary extends Component {

    renderMissingTestablesAction() {
        const { sprint } = this.props
        return (
            <div>
              <Pluralize singular="issue" count={sprint.num_missing_testable_issues}/>
               &nbsp;without testables
            </div>
        )
    }

    renderMissingAssignedAction() {
        const { sprint } = this.props
        return (
            <div>
              <Pluralize singular="issue" count={sprint.num_issues_unassigned}/>
              &nbsp;unassigned
            </div>
        )
    }

    renderMissingEstimates() {
        const { sprint } = this.props
        return (
            <div>
              <Pluralize singular="issue" count={sprint.num_issues_missing_estimates}/>
              &nbsp;without estimates
            </div>
        )
    }

    renderMissingBudget() {
        return (
            <div>
              <div>Missing budget</div>
            </div>
        )
    }
    
    renderAction() {
        const { sprint, can_view_budget } = this.props

        if ( ! sprint ) {
            return null
        }
        
        if ( sprint.num_missing_testable_issues > 0 ) {
            return this.renderMissingTestablesAction()
        } else if ( sprint.num_issues_unassigned > 0 ) {
            return this.renderMissingAssignedAction()
        } else if ( sprint.num_issues_missing_estimates > 0 ) {
            return this.renderMissingEstimates()
        } else if ( can_view_budget && ! sprint.budget > 0 ) {
            return this.renderMissingBudget()
        } else {
            if ( sprint.sprint_type === "sprint" || sprint.sprint_type === "spec" ) {
                return (
                    <div className="icon__status--ok"/>
                )
            }
        }
    }
    
    render() {

        return (
            <div>
              {this.renderAction()}
            </div>
        )
    }
    
}

function mapStateToProps(state, props) {
    const { sprint_id } = props
    const sprint = getSprint(state, sprint_id)

    const can_view_budget = sprint && has_permission(state, sprint.project_id, 'has_view_budget')

    return {
	sprint,
	sprint_id,
        can_view_budget
    }
}

export default connect(mapStateToProps)(SprintStateSummary)

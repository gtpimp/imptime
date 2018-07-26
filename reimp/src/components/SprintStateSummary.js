import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getSprint } from '../actions/Sprints'
import Pluralize from 'react-pluralize'
import { has_permission } from '../actions/Users'
import { getCostSummary, ensureCostSummaryLoaded } from '../actions/CostSummary'
import CurrencyValue from './CurrencyValue'
import ProgressBar from './ProgressBar'
import { showMoney } from '../actions/Mien'
import Floater from "react-floater";

class SprintStateSummary extends Component {

    componentDidMount() {
        const { dispatch, sprint, sprint_id } = this.props
        if ( sprint && sprint.sprint_type_is_clockable ) {
            dispatch(ensureCostSummaryLoaded(sprint_id))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, sprint_id, sprint } = new_props
        if ( sprint && sprint.sprint_type_is_clockable ) {
            dispatch(ensureCostSummaryLoaded(sprint_id))
        }
    }

    renderHasAdhocIssuesAction() {
        const { sprint } = this.props
        return (
            <div>
              {sprint.num_adhoc_issues}
              &nbsp;
              <Pluralize singular="issue" showCount={false} count={sprint.num_adhoc_issues}/>
              &nbsp;
              <Pluralize singular="is" plural="are" showCount={false} count={sprint.num_adhoc_issues}/>
              &nbsp;adhoc
            </div>
        )
    }

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

    renderOverBudget() {
        return (
            <div>
              <div>Budget exceeded</div>
            </div>
        )
    }

    renderExceedingDevCost() {
        return (
            <div>
              <div>Dev going slower than expected</div>
            </div>
        )
    }

    renderBudgetProgress() {
        const { cost_summary, can_view_budget  } = this.props

        if ( can_view_budget ) {
            return (
                <ProgressBar current={ cost_summary.spent } max={ cost_summary.budget } />
            )
        } else {
            return (
                <ProgressBar current={ cost_summary.progress_against_budget } max={ 1.0 } />
            )
        }
    }

    renderActual() {
        const { cost_summary, show_money  } = this.props
        if ( ! show_money ) {
            return null
        }
        return (
            <div className="sprint-state-summary__actual">
              Spent: <CurrencyValue value={cost_summary.spent} />
            </div>
        )
    }

    renderBudget() {
        const { sprint, can_view_budget } = this.props
        if ( ! can_view_budget ) {
            return null
        }
        return (
            <div className="sprint-state-summary__budget">
                Budget: {<CurrencyValue value={sprint.budget} />}
            </div>
        )
    }

    renderUnhandledProblems() {
        const { sprint, cost_summary, can_view_budget } = this.props
        if ( sprint.num_missing_testable_issues > 0 ) {
            return this.renderMissingTestablesAction()
        } else if ( sprint.num_issues_unassigned > 0 ) {
            return this.renderMissingAssignedAction()
        } else if ( sprint.num_issues_missing_estimates > 0 ) {
            return this.renderMissingEstimates()
        } else if ( can_view_budget && ! sprint.budget > 0 ) {
            return this.renderMissingBudget()
        } else if ( can_view_budget && sprint.budget > 0 && cost_summary && !cost_summary.under_budget ) {
            return this.renderOverBudget()
        } else if ( cost_summary.projections.revised_dev_commission_cost > cost_summary.original_dev_commission_cost ) {
            return this.renderExceedingDevCost()
        }
    }

    renderWarnings() {
        const { sprint } = this.props

        const has_warnings = sprint.num_adhoc_issues > 0 || sprint.num_management_alert_issues > 0
        if ( ! has_warnings ) {
            return null
        }

        return (
            <Floater
                title="Warning"
                disableHoverToClick
                event="hover"
                eventDelay={0}
                placement="bottom"
                content={
                    <div className="sprint-state-summary__warnings" data-tip="hello world" data-for="main_tooltip" >
                      { sprint.num_management_alert_issues > 0 &&
                        (
                            <p>
                              <Pluralize singular="issue" count={sprint.num_management_alert_issues}/>
                              &nbsp;
                              <Pluralize singular="is" plural="are" showCount={false} count={sprint.num_management_alert_issues}/>
                              &nbsp;
                              blocked. Please find a resolution and then change the issue status to <i>waiting</i>.
                            </p>
                        )
                      }
                      { sprint.num_adhoc_issues > 0 &&
                        (
                            <p>
                              <Pluralize singular="issue" count={sprint.num_adhoc_issues}/>
                              &nbsp;
                              <Pluralize singular="is" plural="are" showCount={false} count={sprint.num_adhoc_issues}/>
                              &nbsp;
                              ad hoc and <Pluralize singular="requires" plural="require" showCount={false} count={sprint.num_adhoc_issues}/> classification.
                              Please change <Pluralize singular="it" plural="them" showCount={false} count={sprint.num_adhoc_issues}/> to a more specific type.
                            </p>
                        )
                      }
                    </div>
                }
            >
              <div className="icon--warning"></div>
            </Floater>
        )
    }
    
    renderAction() {
        const { sprint, cost_summary } = this.props

        if ( ! sprint || ! cost_summary ) {
            return null
        }

        return (
            <div className="sprint-state-summary">
              { this.renderBudgetProgress() }
              { this.renderActual() }
              { this.renderBudget() }
              <div className="sprint-state-summary__problems--unhandled">
                { this.renderUnhandledProblems() }
              </div>
              { this.renderWarnings() }
            </div>
        )
        
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
    const cost_summary = getCostSummary(state, sprint_id)

    const show_money = sprint && showMoney(state, sprint.project_id)
    const can_view_budget = show_money && sprint && has_permission(state, sprint.project_id, 'has_view_budget')

    return {
	sprint,
	sprint_id,
        cost_summary,
        can_view_budget,
        show_money
    }
}

export default connect(mapStateToProps)(SprintStateSummary)

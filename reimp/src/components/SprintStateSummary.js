import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getSprint } from '../actions/Sprints'
import Pluralize from 'react-pluralize'
import { has_permission } from '../actions/Users'
import { getCostSummary, ensureCostSummaryLoaded } from '../actions/CostSummary'
import CurrencyValue from './CurrencyValue'
import ProgressBar from './ProgressBar'
import { showMoney } from '../actions/Mien'
import Floater from "react-floater"
import Hours from './Hours'

class SprintStateSummary extends Component {

    componentDidMount() {
        const { dispatch, sprint, sprint_id, optional_cost_summary } = this.props
        if ( sprint && sprint.sprint_type_is_clockable && !optional_cost_summary ) {
            dispatch(ensureCostSummaryLoaded(sprint_id))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, sprint_id, sprint, optional_cost_summary } = new_props
        if ( sprint && sprint.sprint_type_is_clockable && !optional_cost_summary ) {
            dispatch(ensureCostSummaryLoaded(sprint_id))
        }
    }

    renderMissingTestables() {
        const { sprint } = this.props
        return (
            <div>
              <Pluralize singular="issue" count={sprint.num_missing_testable_issues}/>
               &nbsp;without testables
            </div>
        )
    }

    renderMissingTestablesDescription() {
        const { sprint } = this.props
        return (
            <div className="sprint-state-summary__section" key="missing_testables_description">
              <Pluralize singular="issue" count={sprint.num_missing_testable_issues}/>
              &nbsp;without testables. All issues that will be estimated require testables.
              <br/>
            </div>
        )
    }

    renderMissingAssigned() {
        const { sprint } = this.props
        return (
            <div>
              <Pluralize singular="issue" count={sprint.num_issues_unassigned}/>
              &nbsp;unassigned
            </div>
        )
    }

    renderMissingAssignedDescription() {
        const { sprint } = this.props
        return (
            <div className="sprint-state-summary__section" key="missing_assigned_description">
              <Pluralize singular="issue" count={sprint.num_issues_unassigned}/>
              &nbsp;unassigned. All issues must be assigned before working on them.
              <br/>
            </div>
        )
    }

    renderMissingEstimates() {
        const { sprint } = this.props
        return (
            <div>
              <Pluralize singular="issue" count={sprint.num_issues_missing_estimates}/>
              &nbsp;without estimates.
            </div>
        )
    }

    renderMissingEstimatesDescription() {
        const { sprint } = this.props
        return (
            <div className="sprint-state-summary__section" key="missing_estimates_description">
              <Pluralize singular="issue" count={sprint.num_issues_missing_estimates}/>
              &nbsp;without estimates. All issues must be estimated before working on them.
              <br/>
            </div>
        )
    }

    renderMissingBudget() {
        return (
            <div>
              <div>Missing budget.</div>
            </div>
        )
    }

    renderMissingBudgetDescription() {
        return (
            <div className="sprint-state-summary__section" key="missing_budget_description">
              <div>Missing budget. All sprints require a budget, even if it's just an indication.</div>
              <br/>
            </div>
        )
    }

    renderOverBudget() {
        return (
            <div>
              <div>Budget exceeded.</div>
            </div>
        )
    }

    renderOverBudgetDescription() {
        return (
            <div className="sprint-state-summary__section" key="over_budget_description">
              <div>Budget exceeded. The budget on this sprint has been exceeded, either increase the budget or remove some issues.</div>
              <br/>
            </div>
        )
    }

    renderExceedingDevCost() {
        return (
            <div>
              <div>Slow dev.</div>
            </div>
        )
    }

    renderExceedingDevCostDescription() {
        return (
            <div className="sprint-state-summary__section" key="exceeding_dev_cost_description">
              <div>The work on issues is going slower than expected, this is likely to cause a budget over-run if not addressed. </div>
              <br/>
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

    renderEstimate() {
        const { cost_summary } = this.props
        return (
            <div className="sprint-state-summary__estimate">
              <div className="sprint-state-summary__estimate_row">
                Estimated issue work remaining: &nbsp;<Hours hours={cost_summary.projections.original_open_dev_hours} /> hours
              </div>
            </div>
        )
    }

    renderUnhandledProblems() {
        const { sprint, cost_summary, can_view_budget } = this.props

        let most_pressing_problem_rendered = null
        let most_pressing_problem_description = []
        if ( sprint.num_missing_testable_issues > 0 ) {
            most_pressing_problem_rendered = most_pressing_problem_rendered || this.renderMissingTestables()
            most_pressing_problem_description.push(this.renderMissingTestablesDescription())
        }
        if ( sprint.num_issues_unassigned > 0 ) {
            most_pressing_problem_rendered = most_pressing_problem_rendered || this.renderMissingAssigned()
            most_pressing_problem_description.push(this.renderMissingAssignedDescription())
        }
        if ( sprint.num_issues_missing_estimates > 0 ) {
            most_pressing_problem_rendered = most_pressing_problem_rendered || this.renderMissingEstimates()
            most_pressing_problem_description.push(this.renderMissingEstimatesDescription())
        }
        if ( can_view_budget && ! sprint.budget > 0 ) {
            most_pressing_problem_rendered = most_pressing_problem_rendered || this.renderMissingBudget()
            most_pressing_problem_description.push(this.renderMissingBudgetDescription())
        }
        if ( can_view_budget && sprint.budget > 0 && cost_summary && !cost_summary.under_budget ) {
            most_pressing_problem_rendered = most_pressing_problem_rendered || this.renderOverBudget()
            most_pressing_problem_description.push(this.renderOverBudgetDescription())
        }
        if ( cost_summary.projections.revised_dev_commission_cost > cost_summary.original_dev_commission_cost ) {
            most_pressing_problem_rendered = most_pressing_problem_rendered || this.renderExceedingDevCost()
            most_pressing_problem_description.push(this.renderExceedingDevCostDescription())
        }

        if ( most_pressing_problem_rendered === null ) {
            return null
        }

        return (
            <div>
              <Floater
                  title="Problems"
                  disableHoverToClick
                  event="hover"
                  eventDelay={0}
                  placement="right"
                  content={most_pressing_problem_description}
              >
                <div className="sprint-state-summary__problems--unhandled">
                  <div className="icon--error"></div>
                  {most_pressing_problem_rendered}
                </div>
              </Floater>
            </div>
        )
    }

    renderWarnings() {
        const { sprint } = this.props

        const has_warnings = sprint.num_adhoc_issues > 0 ||
                             sprint.num_management_alert_issues > 0 ||
                             sprint.num_open_risky_issues > 0
        if ( ! has_warnings ) {
            return null
        }

        return (
            <div>
              <Floater
                  title="Warning"
                  disableHoverToClick
                  event="hover"
                  eventDelay={0}
                  placement="right"
                  content={
                      <div className="sprint-state-summary__warnings">
                        { sprint.num_management_alert_issues > 0 &&
                          (
                              <div className="floater__section">
                                <Pluralize singular="issue" count={sprint.num_management_alert_issues}/>
                                &nbsp;
                                <Pluralize singular="is" plural="are" showCount={false} count={sprint.num_management_alert_issues}/>
                                &nbsp;
                                blocked. Find a resolution and then change the issue status to <i>waiting</i> to remove this warning.
                              </div>
                          )
                        }
                        { sprint.num_adhoc_issues > 0 &&
                          (
                              <div className="floater__section">
                                <Pluralize singular="issue" count={sprint.num_adhoc_issues}/>
                                &nbsp;
                                <Pluralize singular="is" plural="are" showCount={false} count={sprint.num_adhoc_issues}/>
                                &nbsp;
                                ad hoc and <Pluralize singular="requires" plural="require" showCount={false} count={sprint.num_adhoc_issues}/> classification.
                                Please change <Pluralize singular="it" plural="them" showCount={false} count={sprint.num_adhoc_issues}/> to a more specific type.
                              </div>
                          )
                        }
                        { sprint.num_open_risky_issues > 0 &&
                          (
                              <div className="floater__section">
                                <Pluralize singular="issue" count={sprint.num_open_risky_issues}/>
                                &nbsp;
                                <Pluralize singular="is" plural="are" showCount={false} count={sprint.num_open_risky_issues}/>
                                &nbsp;
                                risky. This implies the estimates or deadlines for this sprint might not be accurate.
                              </div>
                          )
                        }
                      </div>
                  }
              >
                <div className="icon--warning"></div>
              </Floater>
            </div>
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
              { this.renderEstimate() }
              { this.renderUnhandledProblems() }
              { this.renderWarnings() }
            </div>
        )
        
    }
    
    render() {

        return this.renderAction()
    }
    
}

function mapStateToProps(state, props) {
    const { sprint_id, optional_cost_summary } = props
    const sprint = getSprint(state, sprint_id)
    
    const cost_summary = optional_cost_summary || getCostSummary(state, sprint_id)

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

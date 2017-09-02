import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {ensureCostSummaryLoaded, getCostSummary} from '../actions/CostSummary'
import OtherUser from '../components/OtherUser'
import CurrencyValue from '../components/CurrencyValue'

class SprintCostSummary extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {sprint_id, project_id, sprint, project, dispatch} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureCostSummaryLoaded(sprint_id))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { dispatch} = this.props
        dispatch(ensureProjectsLoaded([new_props.project_id]))
        dispatch(ensureSprintsLoaded([new_props.sprint_id]))
        dispatch(ensureCostSummaryLoaded(new_props.sprint_id))

        if ( new_props.sprint.id !== this.props.sprint.id ||
             new_props.sprint.name !== this.props.sprint.name ||
             new_props.project.name !== this.props.project.name ) {
            this.refresh()
        }
    }

    refresh() {
    }

    renderUser(value, index) {
        return (
            <div>
              <li className="cost-summary___user cost-summary__italics">
                <span className="cost-summary___user-details">
                 : <CurrencyValue value={value} />
                </span>
                <span className="cost-summary___user-name">
                  <OtherUser value={index} />
                </span>
              </li>
            </div>
        )
    }

    renderRole(role, index) {
        return (
            <div>
              <h3 className="cost-summary___no-colour-pad">{index}</h3>
              <ul className="cost-summary__list">
                <li className="cost-summary___no-colour-pad">Estimate: <CurrencyValue value={role.budget} /></li>
                <li className="cost-summary__italics">without {role.ratio_scope_creep}% scope creep:
                  <CurrencyValue value={role.budget_without_scope_creep} /></li>
                <li>
                  <div>
                    { role.under_budget &&
                      <span className="cost-summary___green">
                        Actual: <CurrencyValue value={role.hours_billable_core_rate} />
                      </span>
                    }
                  </div>
                  <div>
                    { ! role.under_budget &&
                      <span className="cost-summary___red">
                        Actual: <CurrencyValue value={role.hours_billable_core_rate} />
                      </span>
                    }
                  </div>
                </li>
                { role.per_user &&
                  <div>
                    {map(role.per_user, (user, index) =>
                        <div key={index}>
                          { this.renderUser(user, index) }
                        </div>
                     )}
                  </div>
                }
              </ul>
            </div>
        )
    }

    render() {

        const { sprint, project, cost_summary, per_role } = this.props

        return (
            <div className="cost-summary__content">
              <p>
                <h2 className="cost-summary__sub-header">Client expectations</h2>
                <ul className="cost-summary__list">
                  <li>Budget given to client: <CurrencyValue value={cost_summary.budget} /></li>
                  <li>Internal commission: <CurrencyValue value={cost_summary.internal_commision} /></li>
                  <li>Spendable budget: <CurrencyValue value={cost_summary.spendable_budget} /></li>
                </ul>
              </p>

              <p>
                <h2 className="cost-summary__sub-header">Estimated versus budget</h2>
                <ul className="cost-summary__list">
                  <li>
                    Sprint estimated cost: <CurrencyValue value={cost_summary.estimated_cost} />
                  </li>
                  <li>
                    <div>
                      { cost_summary.under_budget &&
                        <span className="cost-summary___green">
                          {cost_summary.spendable_budget_msg}
                        </span>
                      }
                    </div>
                    <div>
                      { ! cost_summary.under_budget &&
                        <span className="cost-summary___red">
                          {cost_summary.spendable_budget_msg}
                        </span>
                      }
                    </div>
                  </li>
                </ul>
              </p>

              <p>
                <h2 className="cost-summary__sub-header">Actual versus budget</h2>
                <ul className="cost-summary__list">
                  <li>
                    Spent so far: <CurrencyValue value={cost_summary.spent} />
                  </li>
                </ul>
              </p>

              <div>
                { cost_summary.under_budget &&
                  <div className="cost-summary___green cost-summary__colourbar">
                    {cost_summary.budget_status}
                  </div>
                }
              </div>
              <div>
                { ! cost_summary.under_budget &&
                  <div className="cost-summary___red cost-summary__colourbar">
                    {cost_summary.budget_status}
                  </div>
                }
              </div>

              <h2 className="cost-summary__header">Breakdown of actuals versus estimated</h2>

              <div className="cost-summary__roles">
                { per_role &&
                  <div>
                    {map(per_role, (role, index) =>
                        <div className="cost-summary__role" key={index}>
                          {this.renderRole(role, index)}
                        </div>
                     )}
                  </div>
                }
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {sprint_id, project_id} = props
    const sprint = getSprint(state, sprint_id) || {}
    const project = getProject(state, project_id) || {}
    const cost_summary = getCostSummary(state, sprint_id) || {}
    const per_role = cost_summary.per_role || {}

    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        cost_summary: cost_summary,
        per_role: per_role,
    }
}

export default connect(mapStateToProps)(SprintCostSummary)

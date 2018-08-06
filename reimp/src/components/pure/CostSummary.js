import React, {Component} from 'react'
import ProgressBar from '../ProgressBar'
import map from 'lodash/map'
import OtherUser from '../OtherUser'
import CurrencyValue from '../CurrencyValue'

class CostSummary extends Component {

    renderUser(value, index) {
        return (
            <div>
              <div className="cost-summary___user cost-summary__italics">
                <span className="cost-summary___user-details">
                 : <CurrencyValue value={value} />
                </span>
                <span className="cost-summary___user-name">
                  <OtherUser user_id={index} />
                </span>
              </div>
            </div>
        )
    }

    renderRole(role, index) {
        return (
            <div>
              <h3 className="cost-summary___no-colour-pad">{index}</h3>
              <ul className="cost-summary__list">
                <li>
                  <div className="cost-summary__estimate_without_scope_creep">
                    <div>Estimate: </div>
                    <CurrencyValue value={role.budget} />
                  </div>
                </li>
                <li>
                  <div className="cost-summary__estimate_with_scope_creep">
                    <div>without {role.ratio_scope_creep}% scope creep:</div>
                    <CurrencyValue value={role.budget_without_scope_creep} />
                  </div>
                </li>
                <li>
                  <div>
                    { role.under_budget &&
                      <div className="cost-summary__within_budget">
                        <div>Actual:</div>
                        <CurrencyValue value={role.hours_billable_core_rate} />
                      </div>
                    }
                  </div>
                  <div>
                    { ! role.under_budget &&
                      <div className="cost-summary__over_budget">
                        <div> Actual:</div>
                        <CurrencyValue value={role.hours_billable_core_rate} />
                      </div>
                    }
                  </div>
                </li>
                { role.per_user &&
                  <li>
                    {map(role.per_user, (user, index) =>
                        <div key={index}>
                          { this.renderUser(user, index) }
                        </div>
                     )}
                  </li>
                }
              </ul>
            </div>
        )
    }

    render() {

        const { cost_summary } = this.props
        const per_role = cost_summary.per_role

        return (
            <div className="cost-summary__content">
              <p className="cost-summary__tile">
                <h2 className="cost-summary__sub-header">Client expectations</h2>
                <ul className="cost-summary__list">
                  <li>Budget given to client: <CurrencyValue value={cost_summary.budget} /></li>
                  <li>Internal commission: <CurrencyValue value={cost_summary.internal_commision} /></li>
                  <li>Spendable budget: <CurrencyValue value={cost_summary.spendable_budget} /></li>
                </ul>
              </p>

              <p className="cost-summary__tile">
                <h2 className="cost-summary__sub-header">Estimated versus budget</h2>
                <ul className="cost-summary__list">
                  <li>
                    Sprint estimated cost: <CurrencyValue value={cost_summary.estimated_cost} />
                  </li>
                  <li>
                    <div>
                      { cost_summary.under_budget &&
                        <span className="cost-summary__within_budget">
                          {cost_summary.spendable_budget_msg}
                        </span>
                      }
                    </div>
                    <div>
                      { ! cost_summary.under_budget &&
                        <span className="cost-summary__over_budget">
                          {cost_summary.spendable_budget_msg}
                        </span>
                      }
                    </div>
                  </li>
                </ul>
              </p>

              <p className="cost-summary__tile">
                <h2 className="cost-summary__sub-header">Actual versus budget</h2>
                <ul className="cost-summary__list">
                  <li>
                    Spent so far: <CurrencyValue value={cost_summary.spent} />
                  </li>
                  <li>
                    <ProgressBar current={ cost_summary.spent } max={ cost_summary.spendable_budget } />
                  </li>
                </ul>

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
              </p>

              <div className="cost-summary__tile">
                <h2 className="cost-summary__sub-header">Breakdown of actuals versus estimated</h2>

                <div className="cost-summary__roles">
                  {map(per_role, (role, index) =>
                      <div className="cost-summary__role" key={index}>
                        {this.renderRole(role, index)}
                      </div>
                   )}
                </div>
              </div>
            </div>
        )
    }
}

export default CostSummary

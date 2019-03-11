import React, {Component} from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { countBy } from 'lodash'
import TinyCard from './TinyCard'
import TinyCardRow from './TinyCardRow'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { ensureSprintsLoaded, getSprint } from '../actions/Sprints'
import { setCardBreadcrumbsHelper } from '../actions/Breadcrumbs'
import Pluralize from 'react-pluralize'
import { getCostSummary, ensureCostSummaryLoaded } from '../actions/CostSummary'
import { fetchIssuesIfNeeded } from '../actions/Issues'
import { makeSelIssues } from '../selectors/IssueListSelectors'
import { update_list_filter } from '../actions/ItemList'

class TinyProblemsCard extends Component {

    componentDidMount() {
        const { sprint_id, sprint, project_id, project, dispatch, list_key } = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureCostSummaryLoaded(sprint_id))
        dispatch(update_list_filter(list_key, {sprint_id: sprint_id}))
        this.refresh(sprint, project)
    }

    componentWillReceiveProps(new_props) {
        const { sprint_id, project_id, dispatch, list_key } = new_props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureCostSummaryLoaded(sprint_id))
        dispatch(fetchIssuesIfNeeded(list_key))
        if (new_props.sprint.id !== this.props.sprint.id ||
            new_props.sprint.name !== this.props.sprint.name ||
            new_props.project.name !== this.props.project.name) {
            this.refresh(new_props.sprint, new_props.project)
        }
    }

    refresh(sprint, project) {
        const { dispatch, project_id, sprint_id } = this.props
        if (project && sprint) {
            const card = {id: 'problems',
                          name: 'Problems'}
            dispatch(setCardBreadcrumbsHelper(project, sprint, card))
        }
    }

    render() {
        const { sprint_name,
                project_name,
                budget,
                spent,
                revised_dev_commission_cost,
                original_dev_commission_cost,
                num_missing_testable_issues,
                num_issues_unassigned,
                num_issues_missing_estimates,
                num_estimate_too_large,
                num_adhoc_issues,
                num_management_alert_issues,
                num_open_risky_issues,
                num_open_issues_needed } = this.props
        return (
            <TinyCard title="Problems" project_name={project_name} sprint_name={sprint_name}>
            <TinyCardRow>
            <span>Sprint problems:</span>
            </TinyCardRow>
            { budget === 0 &&
              <TinyCardRow>
                <span></span>
                <span>Missing budget</span>
              </TinyCardRow>
            }
            { budget !== 0 && spent > budget &&
              <TinyCardRow>
                <span></span>
                <span>Budget exceeded</span>
              </TinyCardRow>
            }
            { revised_dev_commission_cost > original_dev_commission_cost &&
              <TinyCardRow>
                <span></span>
                <span>Slow development</span>
              </TinyCardRow>
            }
            { budget !== 0 &&
              spent <= budget &&
              revised_dev_commission_cost <= original_dev_commission_cost &&
              <TinyCardRow>
                <span></span>
                <span>None</span>
              </TinyCardRow>
            }
            <TinyCardRow>
              <span>Sprint warnings:</span>
            </TinyCardRow>
            { num_adhoc_issues > 0 &&
            <TinyCardRow>
              <span></span>
              <span>
                <Pluralize singular="issue" count={num_adhoc_issues} />
            &nbsp;
                <Pluralize singular="is" plural="are" showCount={false} count={num_adhoc_issues} />
            &nbsp;ad hoc
              </span>
            </TinyCardRow>
            }
            { num_management_alert_issues > 0 &&
              <TinyCardRow>
                <span></span>
                <span>
                  <Pluralize singular="issue" count={num_management_alert_issues}/>
             &nbsp;
                <Pluralize singular="is" plural="are" showCount={false} count={num_management_alert_issues}/>
             &nbsp;blocked
                </span>
              </TinyCardRow>
            }
            { num_open_risky_issues > 0 &&
              <TinyCardRow>
                <span></span>
                <span>
                  <Pluralize singular="issue" count={num_open_risky_issues}/>
             &nbsp;
                <Pluralize singular="is" plural="are" showCount={false} count={num_open_risky_issues}/>
             &nbsp;risky
                </span>
              </TinyCardRow>
            }
            { num_open_issues_needed > 0 &&
              <TinyCardRow>
                <span></span>
                <span>
                  <Pluralize singular="issue" count={num_open_issues_needed}/>
             &nbsp;
                <Pluralize singular="is" plural="are" showCount={false} count={num_open_issues_needed}/>
             &nbsp;still open
                </span>
              </TinyCardRow>
            }
            { num_adhoc_issues === 0 &&
              num_management_alert_issues === 0 &&
              num_open_risky_issues === 0 &&
              num_open_issues_needed === 0 &&
              <TinyCardRow>
                <span></span>
                <span>None</span>
              </TinyCardRow>
            }
              <TinyCardRow>
                <span>Issue problems:</span>
              </TinyCardRow>
              { num_missing_testable_issues > 0 &&
                <TinyCardRow>
                  <span></span>
                  <span>
                    <Pluralize singular="issue" count={num_missing_testable_issues} />
                &nbsp;without testables
                  </span>
                </TinyCardRow>
              }
              { num_issues_unassigned > 0 &&
                <TinyCardRow>
                  <span></span>
                  <span>
                    <Pluralize singular="issue" count={num_issues_unassigned} />
                &nbsp;unassigned
                  </span>
                </TinyCardRow>
              }
              { num_issues_missing_estimates > 0 &&
                <TinyCardRow>
                  <span></span>
                  <span>
                    <Pluralize singular="issue" count={num_issues_missing_estimates} />
                &nbsp;without&nbsp;
                <Pluralize singular="estimate" showCount={false} count={num_issues_missing_estimates} />
                  </span>
                </TinyCardRow>
              }
              { num_estimate_too_large > 0 &&
                <TinyCardRow>
                  <span></span>
                  <span>
                    <Pluralize singular="issue" count={num_estimate_too_large} />
            &nbsp;with&nbsp;large&nbsp;
                  <Pluralize singular="estimate" showCount={false} count={num_estimate_too_large} />
                  </span>
                </TinyCardRow>
              }
              { num_missing_testable_issues === 0 &&
                num_issues_unassigned === 0 &&
                num_issues_missing_estimates === 0 &&
                num_estimate_too_large === 0 &&
                <TinyCardRow>
                  <span></span>
                  <span>None</span>
                </TinyCardRow>
              }
            </TinyCard>
        )
    }
}

const makeMapStateToProps = () => {
    const selIssues = makeSelIssues()

    function mapStateToProps(state, props) {
        const { list_key } = props
        const project_id = props.match.params.projectId
        const sprint_id = props.match.params.sprintId
        const sprint = getSprint(state, sprint_id) || {}
        const project = getProject(state, project_id) || {}
        const sprint_name = sprint.name
        const project_name = project.name
        const cost_summary = getCostSummary(state, sprint_id) || {}
        const projections = cost_summary.projections || {}
        const budget = sprint.budget
        const spent = cost_summary.spent
        const revised_dev_commission_cost = projections.revised_dev_commission_cost
        const original_dev_commission_cost = projections.original_dev_commission_cost
        const num_missing_testable_issues = sprint.num_missing_testable_issues
        const num_issues_unassigned = sprint.num_issues_unassigned
        const num_issues_missing_estimates = sprint.num_issues_missing_estimates
        const num_adhoc_issues = sprint.num_adhoc_issues
        const num_management_alert_issues = sprint.num_management_alert_issues
        const num_open_issues_needed = sprint.num_open_issues_needed
        const num_open_risky_issues = sprint.num_open_risky_issues
        const issues = selIssues(state, props)
        const issue_estimate_too_large = countBy(issues, 'estimate_too_large')
        const num_estimate_too_large = issue_estimate_too_large.true

        return {
            project_id,
            sprint_id,
            sprint,
            project,
            sprint_name,
            project_name,
            budget,
            spent,
            revised_dev_commission_cost,
            original_dev_commission_cost,
            num_missing_testable_issues,
            num_issues_unassigned,
            num_issues_missing_estimates,
            num_estimate_too_large,
            num_adhoc_issues,
            num_management_alert_issues,
            num_open_issues_needed,
            num_open_risky_issues,
            issues
        }
    }
    return mapStateToProps
}

export default withRouter(connect(makeMapStateToProps)(TinyProblemsCard))

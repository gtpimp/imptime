import React, {Component} from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { values, sumBy } from 'lodash'
import TinyCard from './TinyCard'
import TinyCardRow from './TinyCardRow'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { ensureSprintsLoaded, getSprint, updateSprintBudget, is_sprint_invalidated } from '../actions/Sprints'
import { setSprintBreadcrumbsHelper } from '../actions/Breadcrumbs'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import { getCostSummary, ensureCostSummaryLoaded } from '../actions/CostSummary'
import CurrencyValue from './CurrencyValue'
import { has_permission } from '../actions/Users'
import SprintBudgetForm from './form/SprintBudgetForm'
import EditableProperty from './form/EditableProperty'

class TinyBudgetCard extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    componentDidMount() {
        const {sprint_id, sprint, project_id, project, dispatch} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureCostSummaryLoaded(sprint_id))
        this.refresh(sprint, project)
    }

    componentWillReceiveProps(new_props) {
        const { sprint_id, project_id, dispatch } = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureCostSummaryLoaded(sprint_id))
        if (new_props.sprint.id !== this.props.sprint.id ||
            new_props.sprint.name !== this.props.sprint.name ||
            new_props.project.name !== this.props.project.name) {
            this.refresh(new_props.sprint, new_props.project)
        }
    }

    refresh(sprint, project) {
        const { dispatch } = this.props
        dispatch(setSprintBreadcrumbsHelper(project, sprint))
    }

    onChange(new_value) {
        const { dispatch, sprint_id } = this.props
        dispatch(updateSprintBudget([sprint_id], new_value.budget))
    }

    render() {
        const { sprint_name, project_name, sprint_id, project_id, budget , actual_spent, can_edit, can_view } = this.props
        return (
            <TinyCard title="Budget" project_name={project_name} sprint_name={sprint_name}>
              <PermissionInspectorHighlighter project_id={project_id} permission_name="has_edit_budget">
                <PermissionInspectorHighlighter project_id={project_id} permission_name="has_view_budget">
                  <TinyCardRow>
                    <span>Budget</span>
                    <EditableProperty property_key={'sprint_budget_'+sprint_id}
                                      initial_value={budget}
                                      onChange={this.onChange}
                                      can_edit={can_edit}
                                      edit_as_modal={true}
                                      actionLabel="Edit Sprint Budget"
                    >
                      <SprintBudgetForm sprint_id={sprint_id} />
                      <div className="text-component--readonly">
                        { can_view &&
                        <CurrencyValue value={budget} />
                        }
                      </div>
                      <div className="text-component--empty"></div>
                    </EditableProperty>
                  </TinyCardRow>
                </PermissionInspectorHighlighter>
              </PermissionInspectorHighlighter>
              <PermissionInspectorHighlighter project_id={project_id} permission_name="has_view_budget">
                <TinyCardRow>
                  <span>Amount Spent</span>
                  <CurrencyValue value={actual_spent} />
                </TinyCardRow>
              </PermissionInspectorHighlighter>
            </TinyCard>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.match.params.projectId
    const sprint_id = props.match.params.sprintId
    const sprint = getSprint(state, sprint_id) || {}
    const project = getProject(state, project_id) || {}
    const budget = sprint.budget
    const sprint_name = sprint.name
    const project_name = project.name
    const cost_summary = getCostSummary(state, sprint_id) || {}
    const breakdown = cost_summary.breakdown || {}
    const actuals_by_user_id = breakdown.actuals_by_user || {}
    const actuals_by_user = values(actuals_by_user_id)
    const actual_spent = sumBy(actuals_by_user, 'commission_cost')
    const is_invalidated = is_sprint_invalidated(state, sprint_id)
    const can_edit = has_permission(state, project_id, 'has_edit_budget')
    const can_view = has_permission(state, project_id, 'has_view_budget')
    
    return {
        project_id,
        sprint_id,
        sprint,
        project,
        sprint_name,
        project_name,
        budget,
        actual_spent,
        is_invalidated,
        can_edit,
        can_view
    }
}

export default withRouter(connect(mapStateToProps)(TinyBudgetCard))

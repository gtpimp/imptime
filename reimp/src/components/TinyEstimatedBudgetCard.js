import React, {Component} from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import TinyCard from './TinyCard'
import TinyCardRow from './TinyCardRow'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { ensureSprintsLoaded, getSprint } from '../actions/Sprints'
import { setCardBreadcrumbsHelper } from '../actions/Breadcrumbs'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import { getCostSummary, ensureCostSummaryLoaded } from '../actions/CostSummary'
import CurrencyValue from './CurrencyValue'

class TinyEstimatedBudgetCard extends Component {

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
        if (project && sprint) {
            const card = {id: 'estimated_budget',
                          name: 'Estimated Budget'}
            dispatch(setCardBreadcrumbsHelper(project, sprint, card))
        }
    }

    render() {
        const { sprint_name, project_name, project_id, estimated_budget, uncertainty, total } = this.props
        return (
            <TinyCard title="Estimated Budget" project_name={project_name} sprint_name={sprint_name}>
              <PermissionInspectorHighlighter project_id={project_id} permission_name="has_view_budget">
                <TinyCardRow>
                  <span>Estimated Budget</span>
                  <CurrencyValue value={estimated_budget} />
                </TinyCardRow>
                <TinyCardRow>
                  <span>Uncertainty</span>
                  <CurrencyValue value={uncertainty} />
                </TinyCardRow>
                <TinyCardRow>
                  <span>Total</span>
                  <CurrencyValue value={total} />
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
    const sprint_name = sprint.name
    const project_name = project.name
    const cost_summary = getCostSummary(state, sprint_id) || {}
    const breakdown = cost_summary.breakdown || {}
    const totals = breakdown.totals || {}
    const estimated_budget = totals.estimated_cost
    const uncertainty = totals.scope_creep
    const total = totals.grand_total


    
    return {
        project_id,
        sprint_id,
        sprint,
        project,
        sprint_name,
        project_name,
        estimated_budget,
        uncertainty,
        total
    }
}

export default withRouter(connect(mapStateToProps)(TinyEstimatedBudgetCard))

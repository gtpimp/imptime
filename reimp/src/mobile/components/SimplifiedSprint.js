import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import {withRouter} from 'react-router-dom'
import { has_permission } from '../../actions/Users'
import {
    ensureSprintsLoaded,
    getSprint,
    isLoadingSprints
} from '../../actions/Sprints'
import {
    ensureProjectsLoaded,
    getProject,
    isLoadingProjects
} from '../../actions/Projects'
import {
    getCostSummary,
    ensureCostSummaryLoaded
} from '../../actions/CostSummary'
import {
    ensureSprintDeadlinesLoaded,
    getSprintDeadlines
} from '../../actions/SprintDeadlines'
import SimplifiedParagraph from './SimplifiedParagraph'
import SimplifiedSubTitle from './SimplifiedSubTitle'
import ProgressBar from '../../components/ProgressBar'
import CurrencyValue from '../../components/CurrencyValue'

class SimplifiedSprint extends Component {

    componentDidMount() {
        const { dispatch, project_id, sprint_id, sprint_deadline_ids } = this.props
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureCostSummaryLoaded(sprint_id))
        if ( sprint_deadline_ids ) {
            dispatch(ensureSprintDeadlinesLoaded(sprint_deadline_ids))
        }
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
    }

    componentDidUpdate(old_props) {
        const { dispatch, sprint_id, project_id, sprint_deadline_ids } = this.props
        if ( old_props.sprint_id !== sprint_id ) {
            dispatch(ensureSprintsLoaded([sprint_id]))
            dispatch(ensureCostSummaryLoaded(sprint_id))
        }
        if ( old_props.sprint_deadline_ids !== sprint_deadline_ids ) {
            dispatch(ensureSprintDeadlinesLoaded(sprint_deadline_ids))
        }
        if ( old_props.project_id !== project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
    }

    renderProgressStat(name, max, current) {
        return (
            <div className={progress_stat}>
              <div className={progress_stat_name}>
                {name}
              </div>
              <div className={progress_stat_bar}>
                <ProgressBar max={max} current={current} />
              </div>
            </div>
        )
    }
    
    render() {
        const { sprint, project, is_loading, cost_summary, can_view_budget, can_view_money } = this.props

        if ( is_loading ) {
            return null
        }
        
        return (
            <div>
              
              <SimplifiedParagraph>
                <SimplifiedSubTitle>Project: {project.name}</SimplifiedSubTitle>
                <SimplifiedSubTitle>Status: {sprint.status_name}</SimplifiedSubTitle>
                {sprint.description}
              </SimplifiedParagraph>
              
              <SimplifiedParagraph>
                { this.renderProgressStat('dev closed', sprint.num_issues, sprint.num_dev_closed_issues) }
                { this.renderProgressStat('fully closed', sprint.num_issues, sprint.num_completely_closed_issues) }
              </SimplifiedParagraph>
              
              { can_view_budget && sprint.budget && cost_summary && 
                <SimplifiedParagraph>
                  budget <CurrencyValue value={sprint.budget} />
                  { can_view_money && 
                    this.renderProgressStat('spent', cost_summary.budget, cost_summary.spent)
                  }
                </SimplifiedParagraph>
              }
                
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { sprint_id } = props
    const sprint = getSprint(state, sprint_id)
    const project = sprint && getProject(state, sprint.project_id)
    const is_loading = isLoadingSprints(state, [sprint_id]) || !sprint || isLoadingProjects(state, [sprint.project_id]) || !project
    const can_view_money = sprint && has_permission(state, sprint.project_id, 'has_view_ctc_billable_rates')
    const can_view_budget = sprint && can_view_money && has_permission(state, sprint.project_id, 'has_view_budget')
    const cost_summary = getCostSummary(state, sprint_id)
    const sprint_deadline_ids = sprint && sprint.deadline_ids
    const sprint_deadlines = getSprintDeadlines(state, sprint_deadline_ids)

    return {
        sprint_id,
        sprint,
        project_id: sprint && sprint.project_id,
        project,
        is_loading,
        can_view_budget,
        can_view_money,
        cost_summary,
        sprint_deadline_ids,
        sprint_deadlines
    }
    
}

export default withRouter(connect(mapStateToProps)(SimplifiedSprint))

const progress_stat = css`
display: flex;
width: 100%;
`

const progress_stat_name = css`
max-width: 25%;
min-width: 25%;
`

const progress_stat_bar = css`
width: 100%;

`

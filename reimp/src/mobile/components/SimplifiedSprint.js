import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import { css } from 'emotion'
import { default_theme as theme } from '../../theme/default'
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
import Hours from '../../components/Hours'

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
        if ( max === 0 && current === 0 ) {
            return null
        }
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

    renderIssueStatuses() {
        const { sprint, can_view_money } = this.props
        return (
            <SimplifiedParagraph>
              { map(sprint.issues_by_status, (issue_status) =>
                  <div className={mini_section}>
                    <SimplifiedSubTitle>{issue_status.name}</SimplifiedSubTitle>
                    {this.renderProgressStat('number of issues', sprint.num_issues, issue_status.num_issues)}
                    {this.renderProgressStat('hours', issue_status.estimated_hours, issue_status.actual_hours)}

                    { can_view_money &&
                      <SimplifiedParagraph>
                        <div className={value_row}>
                          spent <CurrencyValue value={issue_status.actual_cost} />
                        </div>
                        <div className={value_row}>
                          <div>
                            actual hours
                          </div>
                          <div>
                            <Hours hours={issue_status.actual_hours} />
                          </div>
                        </div>
                        <div className={value_row}>
                          <div>
                            estimated hours
                          </div>
                          <div>
                            <Hours hours={issue_status.estimated_hours} />
                          </div>
                        </div>
                      </SimplifiedParagraph>
                    }
                  </div>
                )}
            </SimplifiedParagraph>
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

              <div className={section}>
                <SimplifiedSubTitle>Estimates</SimplifiedSubTitle>
                { can_view_money && cost_summary &&
                  <SimplifiedParagraph>
                    estimated total cost <CurrencyValue value={cost_summary.breakdown.totals.grand_total} />
                  </SimplifiedParagraph>
                }
                  { cost_summary &&
                    <SimplifiedParagraph>
                      <div className={value_row}>
                        <div>
                          estimated total hours
                        </div>
                        <div className={css`text-align: right; width: 100%;`}>
                          <Hours hours={cost_summary.breakdown.totals.estimated_hours} />
                        </div>
                      </div>
                    </SimplifiedParagraph>
                  }
              </div>
              
              { (can_view_money || can_view_budget) &&
                <div className={section}>
                  <SimplifiedSubTitle>Actuals</SimplifiedSubTitle>
                  { can_view_budget && sprint.budget && cost_summary && 
                    <SimplifiedParagraph>
                      budget <CurrencyValue value={cost_summary.budget} />
                      { can_view_money &&
                        <div>
                          spent <CurrencyValue value={cost_summary.spent} />
                        </div>
                      }
                        { can_view_money &&
                          <div>
                            {this.renderProgressStat('', cost_summary.budget, cost_summary.spent)}
                          </div>
                        }
                    </SimplifiedParagraph>
                  }
                    { can_view_money && ! sprint.budget && cost_summary &&
                      <SimplifiedParagraph>
                        spent <CurrencyValue value={cost_summary.spent} />
                      </SimplifiedParagraph>
                    }
                </div>
              }

              { cost_summary && 
                <div className={section}>
                  <SimplifiedSubTitle>Status breakdown</SimplifiedSubTitle>
                  { this.renderIssueStatuses() }
                </div>
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
max-width: 40%;
min-width: 40%;
`

const progress_stat_bar = css`
width: 100%;

`

const value_row = css`
display: flex;
justify-content: space-between;
`

const section = css`
padding-top: ${theme.spacing.two};
padding-bottom: ${theme.spacing.two};
border-bottom: 1px solid ${theme.colours.border_strong};

`

const mini_section = css`
padding-top: ${theme.spacing.two};
padding-bottom: ${theme.spacing.two};
border-bottom: 1px solid ${theme.colours.border_faint};

`

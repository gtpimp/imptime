// This file is obsolete because there is a newer betterer executive summary
// But keeping because it has an example of how to display every useful piece of information about a sprint,
// including problems, warnings and issue creation activity.

import React, { Component } from 'react'
import { connect } from 'react-redux'
import Pluralize from 'react-pluralize'
import { cx, css } from 'emotion'
import { size, map, flatMap, filter, get } from 'lodash'
import moment from 'moment'
import { default_theme as theme } from '../theme/default'
import { showMoney } from '../actions/Mien'
import { has_permission } from '../actions/Users'
import ProgressBar from './ProgressBar'
import TimeChart from './TimeChart'
import CurrencyValue from './CurrencyValue'
import Hours from './Hours'
import Floater from "react-floater"
import { getSetting } from '../actions/Settings'
import {
    initList,
    invalidateList,
    isLoading,
    getVisibleItemIds,
    getVisibleItems,
    haveItemsBeenRetrieved,
    getLoadingItemIds,
    update_list_filter,
    update_list_format
} from '../actions/ItemList'
import {
    getSprintWidthMode,
    getSprintRoadmapsById,
    getSprintRoadmapIdsFromSprintIds,
    fetchSprintRoadmapsIfNeeded
} from '../actions/SprintRoadmaps'
import {
    fetchSprintDeadlinesIfNeeded,
    getSprintDeadlinesById,
    ensureSprintDeadlinesLoaded,
} from '../actions/SprintDeadlines'
import {
    fetchCostSummariesIfNeeded,
    getCostSummariesById
} from '../actions/CostSummary'
import {
    ENTITY_KEY__SPRINT,
    LIST_KEY__SPRINT_COST_SUMMARY,
    LIST_KEY__SPRINT_ROADMAP,
    LIST_KEY__SPRINT_DEADLINE
} from '../actions/ItemListKeyRegistry'
import {
    fetchSprintsIfNeeded
} from '../actions/Sprints'
import SprintName from './SprintName'
import Timestamp from './Timestamp'
import Card from './Card'

const deadline_row = css`margin-bottom:${theme.spacing.vertical_section_gap};
                         display: flex;
                         justify-content: space-between;`

const deadline_row_cell = css`padding-right:${theme.spacing.horizontal_space_inline};`

class IssuesCreatedTimeChartTooltip extends Component {

    render() {

        const { active, payload, label } = this.props

        if ( ! active || ! payload ) {
            return null
        }
        
        return (
            <div className="time_chart__tooltip">
              { map(payload, (series, index) =>
                  (
                      <div key={series.dataKey+"_"+index} className="time_chart__tooltip_series">
                        <div>
                          <Pluralize singular="issue" count={series.value}/> created {moment(label).format('dddd DD-MMM-YYYY')}
                        </div>
                      </div>
                  )
                )}
                      
            </div>
        )
    }
}

class ProjectRoadmap extends Component {
    
    componentDidMount() {
	const { dispatch, sprint_list_key, roadmap_list_key,
                deadline_list_key, cost_summary_list_key, sprint_deadline_ids,
                project_id } = this.props
        dispatch(initList(sprint_list_key))
        dispatch(initList(deadline_list_key))
        dispatch(initList(roadmap_list_key))
        dispatch(initList(cost_summary_list_key))

        const filter = {project_id: project_id,
                        sprint_status: 'open',
                        sprint_types: ['sprint', 'inbox']}
        dispatch(update_list_filter(sprint_list_key, filter))
        dispatch(update_list_format(sprint_list_key, {roadmap: true}))
        dispatch(fetchSprintsIfNeeded(sprint_list_key))
        
        dispatch(ensureSprintDeadlinesLoaded(sprint_deadline_ids))
        
        dispatch(update_list_filter(roadmap_list_key, filter))
        dispatch(fetchSprintRoadmapsIfNeeded(roadmap_list_key))
        
        dispatch(update_list_filter(cost_summary_list_key, filter))
        dispatch(fetchCostSummariesIfNeeded(cost_summary_list_key))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, sprint_list_key, roadmap_list_key,
               deadline_list_key, cost_summary_list_key, sprint_deadline_ids} = this.props
        const { project_id } = new_props
        if ( project_id !== this.props.project_id ) {

            const filter = { project_id: project_id}
            dispatch(update_list_filter(sprint_list_key, filter))
            dispatch(update_list_filter(roadmap_list_key, filter))
            dispatch(update_list_filter(deadline_list_key, filter))
            dispatch(update_list_filter(cost_summary_list_key, filter))
            dispatch(invalidateList(sprint_list_key))
            dispatch(invalidateList(roadmap_list_key))
            dispatch(invalidateList(deadline_list_key))
            dispatch(invalidateList(cost_summary_list_key))
        }
        dispatch(fetchSprintsIfNeeded(sprint_list_key))
        dispatch(fetchSprintRoadmapsIfNeeded(roadmap_list_key))
        dispatch(fetchSprintDeadlinesIfNeeded(deadline_list_key))
        dispatch(fetchCostSummariesIfNeeded(cost_summary_list_key))
        dispatch(ensureSprintDeadlinesLoaded(sprint_deadline_ids))
    }

    renderDeadlines(sprint) {
        const { sprint_deadlines_by_id } = this.props
        
        const deadlines = filter(sprint_deadlines_by_id, (deadline) => deadline.sprint_id === sprint.id)

        if ( size(deadlines) === 0 ) {
            return (
                <div className={deadline_row}>
                  No deadlines
                </div>
            )
        }
        
        return (
            <div className={deadline_row}>
              <div>
                Deadlines:
              </div>
              { map(deadlines, function(deadline) {
                    return (
                        <div key={deadline.id} className={css`display:flex;`}>
                          <div className={cx(deadline_row_cell, css`font-style:italic`)}>
                            { deadline.description }
                          </div>
                          <div className={deadline_row_cell}>
                            <Timestamp value={deadline.deadline} format="from_now" />
                          </div>
                        </div>
                    )
                })
              }
            </div>
        )
    }

    renderProblems(sprint) {
        const { can_view_budget, cost_summaries_by_id } = this.props
        const cost_summary = cost_summaries_by_id[sprint.id]

        if ( ! cost_summary || ! cost_summary.projections ) {
            return null
        }
        
        const has_problems = (can_view_budget && ! sprint.budget > 0) ||
                             (can_view_budget && sprint.budget > 0 && cost_summary && !cost_summary.under_budget) ||
                             cost_summary.projections.revised_dev_commission_cost > cost_summary.original_dev_commission_cost
        
        const has_warnings = sprint.num_missing_testable_issues > 0 ||
                             sprint.num_issues_unassigned > 0 ||
                             sprint.num_issues_missing_estimates > 0 ||
                             sprint.num_adhoc_issues > 0 ||
                             sprint.num_management_alert_issues > 0 ||
                             sprint.num_open_risky_issues > 0 ||
                             sprint.num_open_issues_needed

        if (! has_problems && ! has_warnings ) {
            return null
        }

        return (
            <div className={deadline_row}>
              { has_problems &&
                <Floater
                    title="Problems"
                    disableHoverToClick
                    event="hover"
                    eventDelay={0}
                    placement="right"
                    content={<div>This sprint has some problems which should be addressed urgently.</div>}>
                  <div className="icon--error"></div>
                </Floater>
              }
              { !has_problems &&
                <Floater
                    title="Problems"
                    disableHoverToClick
                    event="hover"
                    eventDelay={0}
                    placement="right"
                    content={<div>This sprint has no immediate problems.</div>}>
                  <div className="icon__status--ok"></div>
                </Floater>
              }
              { has_warnings &&
                <Floater
                    title="Warning"
                    disableHoverToClick
                    event="hover"
                    eventDelay={0}
                    placement="right"
                    content={<div>This sprint has some warnings which could affect development and projections.</div>}>
                  <div className="icon--warning"></div>
                </Floater>
              }
            </div>
        )
        
    }

    renderRemaining(sprint) {
        const { cost_summaries_by_id } = this.props
        const cost_summary = cost_summaries_by_id[sprint.id]
        if (! cost_summary || !cost_summary.projections ) {
            return null
        }
        return (
            <div className={deadline_row}>
              <div>
                Estimated time left:
              </div>
              <div>
                <Hours hours={cost_summary.projections.original_open_dev_hours} /> hours
              </div>
            </div>
        )
    }

    renderIssueStatusSummary(sprint) {

        const num_open_issues = sprint.num_testable_issues-sprint.num_dev_closed_issues
        return (
            <div>
              <div className={deadline_row}>
                <div>
                  {sprint.num_dev_closed_issues} closed <Pluralize singular="issue" count={sprint.num_dev_closed_issues} showCount={false}/>
                </div>
              </div>
              <div className={deadline_row}>
                <div>
                  {num_open_issues} open <Pluralize singular="issue" count={num_open_issues} showCount={false}/>
                </div>
              </div>
            </div>
        )
    }

    renderBudgetProgress(sprint) {
        const { can_view_budget, show_money, cost_summaries_by_id } = this.props
        const cost_summary = cost_summaries_by_id[sprint.id]

        if (! show_money ) {
            return null
        }
        
        if (! cost_summary ) {
            return null
        }

        if ( ! cost_summary.budget ) {
            return null
        }

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

    renderStartEnd(sprint) {
        return (
            <div className={deadline_row}>
              <div>
                Activity:
              </div>
              <div className={css`font:informational`}>
                { sprint.first_entry &&
                  <div className="project-roadmap__sprint-time-entry">
                    First clock: &nbsp;<Timestamp value={sprint.first_entry.start_time} format="from_now" />
                  </div>
                }
                { sprint.last_entry &&
                  <div className="project-roadmap__sprint-time-entry">
                    Last clock: &nbsp;<Timestamp value={sprint.last_entry.end_time} format="from_now" />
                  </div>
                }
                { !sprint.last_entry &&
                  <div>
                    No clocked time yet
                  </div>
                }
              </div>
            </div>
        )
    }

    renderWorkActivity(sprint) {
        const { sprint_roadmaps_by_id } = this.props
        const roadmap = sprint_roadmaps_by_id[sprint.id]
        if (! roadmap ) {
            return null
        }
        return (
            <div className={deadline_row}>
              <div>Work history</div>
              <div>
                <TimeChart times={roadmap.hours_per_day}
                           yaxis_datakey="daily_hours"
                           xaxis_datakey="started_on"
                           reference_line_hours={0}
                           width={250}
                           height={75}
                />
              </div>
            </div>
        )
    }

    renderIssueCreationActivity(sprint) {
        const { sprint_roadmaps_by_id } = this.props
        const roadmap = sprint_roadmaps_by_id[sprint.id]
        if (! roadmap ) {
            return null
        }
        return (
            <div className={deadline_row}>
              <div>Issue creation</div>
              <div>
                <TimeChart times={roadmap.issues_created_by_day}
                           yaxis_datakey="count"
                           xaxis_datakey="created_day"
                           reference_line_hours={0}
                           width={250}
                           height={75}
                           tooltip_renderer={<IssuesCreatedTimeChartTooltip/>}
                />
              </div>
            </div>
        )
    }

    renderActual(sprint) {
        const { show_money, cost_summaries_by_id } = this.props
        const cost_summary = cost_summaries_by_id[sprint.id]
        if ( ! show_money ) {
            return null
        }
        return (
            <div className={deadline_row}>
              Spent: <CurrencyValue value={cost_summary.spent} />
            </div>
        )
    }

    renderBudget(sprint) {
        const { show_money } = this.props
        if ( ! show_money ) {
            return null
        }

        if ( sprint.budget ) {
            return (
                <div className={deadline_row}>
                  Budget: <CurrencyValue value={sprint.budget} />
                </div>
            )
        }
        
        return (
            <div className={deadline_row}>
              No budget set
            </div>
        )
    }

    renderSprintCard(sprint) {
        return (
            <Card key={sprint.id}>
              <SprintName sprint_id={sprint.id} />
              { this.renderBudgetProgress(sprint) }
              { this.renderProblems(sprint) }
              { this.renderActual(sprint) }
              { this.renderBudget(sprint) }
              { this.renderDeadlines(sprint) }
              { this.renderIssueStatusSummary(sprint) }
              { this.renderRemaining(sprint) }
              { this.renderStartEnd(sprint) }
              { this.renderWorkActivity(sprint) }
              { this.renderIssueCreationActivity(sprint) }
            </Card>
        )
    }

    render() {

        const { is_loading, sprints } = this.props

        if ( is_loading ) {
            return (
                <div>Loading...</div>
            )
        }
        
        return (
            <div ref={ (el) => this.project_roadmap_el = el }>
              <div className={css`display:flex;
                                  flex-flow: row wrap;`}>
                {map(sprints, (sprint) => this.renderSprintCard(sprint))}
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { list_key, project_id } = props
    const sprint_list_key = list_key
    const deadline_list_key = LIST_KEY__SPRINT_DEADLINE
    const roadmap_list_key = LIST_KEY__SPRINT_ROADMAP
    const cost_summary_list_key = LIST_KEY__SPRINT_COST_SUMMARY
    const sprint_ids = getVisibleItemIds(state, list_key)
    const sprints = getVisibleItems(state, list_key, ENTITY_KEY__SPRINT)
    const sprint_roadmap_ids = getSprintRoadmapIdsFromSprintIds(sprint_ids)
    const sprint_roadmaps_by_id = getSprintRoadmapsById(state, sprint_roadmap_ids)
    const is_loading = isLoading(state, list_key) || getLoadingItemIds(state, list_key).length > 0 || !haveItemsBeenRetrieved(state, sprint_ids, ENTITY_KEY__SPRINT)
    const sprint_width_mode = getSprintWidthMode(state, sprint_list_key)
    const sprint_deadline_ids = flatMap(sprints, (sprint) => get(sprint, "deadline_ids", []))
    const sprint_deadlines_by_id = getSprintDeadlinesById(state, sprint_deadline_ids)
    const cost_summary_ids = getVisibleItemIds(state, cost_summary_list_key)
    const cost_summaries_by_id = getCostSummariesById(state, cost_summary_ids)

    const show_money = showMoney(state, project_id)
    const can_view_budget = show_money && has_permission(state, project_id, 'has_view_budget')
    
    return {
        project_id,
        sprint_ids,
        sprint_roadmaps_by_id,
        sprints,
        is_loading,
        sprint_width_mode,
        sprint_list_key,
        deadline_list_key,
        roadmap_list_key,
        cost_summary_list_key,
        sprint_deadlines_by_id,
        cost_summaries_by_id,
        can_view_budget,
        show_money,
        num_business_hours_per_day: getSetting(state, 'NUM_BUSINESS_HOURS_PER_DAY') || 8
    }
}

export default connect(mapStateToProps)(ProjectRoadmap)

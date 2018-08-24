import React, { Component } from 'react'
import { connect } from 'react-redux'
import { cx, css } from 'emotion'
import { size, map, flatMap, filter, get } from 'lodash'
import moment from 'moment'
import { default_theme as theme } from '../theme/default'
import { showMoney } from '../actions/Mien'
import { has_permission } from '../actions/Users'
import ProgressBar from './ProgressBar'
import CurrencyValue from './CurrencyValue'
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
import SprintDeadline from './SprintDeadline'
import Card from './Card'

const deadline_row = css`margin-bottom:${theme.spacing.vertical_section_gap};
                         display: flex;
                         justify-content: space-between;`

const deadline_row_cell = css`padding-right:${theme.spacing.horizontal_space_inline};`

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
                <div>
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
                    First clock: <Timestamp value={sprint.first_entry.start_time} format="from_now" />
                  </div>
                }
                { sprint.last_entry &&
                  <div className="project-roadmap__sprint-time-entry">
                    Last clock: <Timestamp value={sprint.last_entry.end_time} format="from_now" />
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

    renderSprintCard(sprint) {
        return (
            <Card key={sprint.id}>
              <SprintName sprint_id={sprint.id} />
              { this.renderBudgetProgress(sprint) }
              { this.renderActual(sprint) }
              { this.renderStartEnd(sprint) }
              { this.renderDeadlines(sprint) }
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

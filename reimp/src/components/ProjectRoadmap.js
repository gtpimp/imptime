import React, { Component } from 'react'
import { connect } from 'react-redux'
import { cx, css } from 'emotion'
import { uniq,values, compact, filter, size, map, flatMap, get } from 'lodash'
import { default_theme as theme } from '../theme/default'
import { showMoney } from '../actions/Mien'
import { has_permission } from '../actions/Users'
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
    update_list_format,
    update_list_ordering
} from '../actions/ItemList'
import {
    getSprintWidthMode,
    getSprintRoadmapsById,
    getSprintRoadmapIdsFromSprintIds,
    fetchSprintRoadmapsIfNeeded,
    ALL_AVAILABLE_SPRINT_ROADMAP_HEADERS
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
    getFeaturesById,
    ensureFeaturesLoaded
} from '../actions/Features'
import {
    ENTITY_KEY__SPRINT,
    LIST_KEY__SPRINT_COST_SUMMARY,
    LIST_KEY__SPRINT_ROADMAP,
    LIST_KEY__SPRINT_DEADLINE,
    HEADER_LIST_NAME__SPRINT_ROADMAP,
    getCellStyle
} from '../actions/ItemListKeyRegistry'
import {
    fetchSprintsIfNeeded,
    reorderSprints
} from '../actions/Sprints'
import SprintName from './SprintName'
import DivTable from './DivTable'
import DivTableRow from './DivTableRow'
import DivTableCell from './DivTableCell'
import DivTableHeaderRow from './DivTableHeaderRow'
import DivTableHeaderCell from './DivTableHeaderCell'
import MienListColumnConfigurable from './MienListColumnConfigurable'
import Timestamp from './Timestamp'
import FeatureName from './FeatureName'
import EditableSprintStatus from './EditableSprintStatus'
import EditableSprintType from './EditableSprintType'

const deadline_row_cell = css`padding-right:${theme.spacing.horizontal_space_inline};`

class ProjectRoadmap extends Component {
    
    componentDidMount() {
	const { dispatch, sprint_list_key, roadmap_list_key, all_feature_ids,
                deadline_list_key, cost_summary_list_key, sprint_deadline_ids,
                project_id } = this.props
        dispatch(initList(sprint_list_key))
        dispatch(initList(deadline_list_key))
        dispatch(initList(roadmap_list_key))
        dispatch(initList(cost_summary_list_key))

        const filter = {project_id: project_id,
                        sprint_status: 'open',
                        sprint_types: ['sprint', 'spec', 'backlog']}
        dispatch(update_list_filter(sprint_list_key, filter))
        dispatch(update_list_format(sprint_list_key, {roadmap: true}))
        dispatch(update_list_ordering(sprint_list_key, {'sprint_type': 'desc'}))
        dispatch(fetchSprintsIfNeeded(sprint_list_key))
        dispatch(ensureSprintDeadlinesLoaded(sprint_deadline_ids))
        dispatch(ensureFeaturesLoaded(all_feature_ids))
        
        dispatch(update_list_filter(roadmap_list_key, filter))
        dispatch(fetchSprintRoadmapsIfNeeded(roadmap_list_key))
        
        dispatch(update_list_filter(cost_summary_list_key, filter))
        dispatch(fetchCostSummariesIfNeeded(cost_summary_list_key))
    }

    componentWillReceiveProps(new_props) {
        const {project_id, all_feature_ids, dispatch, sprint_list_key, roadmap_list_key,
               deadline_list_key, cost_summary_list_key, sprint_deadline_ids} = new_props
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
        dispatch(ensureFeaturesLoaded(all_feature_ids))
    }

    reorderSprints = (index_of_row_being_moved, original_index_of_destination) => {
        const {dispatch, list_key, sprints} = this.props
        dispatch(reorderSprints(sprints, index_of_row_being_moved, original_index_of_destination, list_key))
    }

    renderSprintRow(sprint, active_headers) {
        const { sprint_deadlines_by_id, sprint_roadmaps_by_id, features_by_id } = this.props

        const sprint_roadmap = sprint_roadmaps_by_id[sprint.id]
        
        return (
            <DivTableRow key={sprint.id} >

              { map(active_headers, function(header) {
                    const header_key = header.key
                    switch(header_key) {
                        case "sprint_name":
                            return (
                                <DivTableCell key={header_key}
                                              extra_style={getCellStyle(header)}>
                                  <SprintName sprint_id={sprint.id} />
                                </DivTableCell>
                            )
                        case "sprint_status":
                            return (
                                <DivTableCell key={header_key}
                                              extra_style={getCellStyle(header)}>
                                  <EditableSprintStatus sprint_ids={[sprint.id]} />
                                </DivTableCell>
                            )
                        case "sprint_type":
                            return (
                                <DivTableCell key={header_key}
                                              extra_style={getCellStyle(header)}>
                                  <EditableSprintType sprint_ids={[sprint.id]} />
                                </DivTableCell>
                            )
                        case "sprint_eta":
                            const deadlines = filter(sprint_deadlines_by_id, (deadline) => deadline.sprint_id === sprint.id)
                            return (
                                <DivTableCell key={header_key}
                                              extra_style={getCellStyle(header)}>
                                  { size(deadlines) === 0 && "No deadlines configured" }
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
                                </DivTableCell>
                            )
                        case "features":
                            const features = uniq(compact(map(sprint_roadmap.feature_ids, (feature_id) => features_by_id[feature_id])))
                            return (
                                <DivTableCell key={header_key}
                                              extra_style={getCellStyle(header)}>
                                  <div>
                                    { map(features, (feature) => (
                                        <div key={feature.id}>
                                          <FeatureName feature_id={feature.id} />
                                        </div>
                                    ))}
                                  </div>
                                </DivTableCell>
                            )
                        default:
                            console.error("Unknown header: " + header_key)
                            
                    }
                })}

              
              
            </DivTableRow>
        )
    }

    render() {


        const { is_loading, sprints, project_id } = this.props
        const that = this
        if ( is_loading ) {
            return (
                <div>Loading...</div>
            )
        }
        
        return (
            <div ref={ (el) => this.project_roadmap_el = el }>
              
              <MienListColumnConfigurable all_headers={ALL_AVAILABLE_SPRINT_ROADMAP_HEADERS}
                                          header_list_name={HEADER_LIST_NAME__SPRINT_ROADMAP}
                >
                  {({active_headers}) => (
                       <DivTable project_id={project_id}
                                 header_list={active_headers}
                                 onReorder={(a,b) => that.reorderSprints(a,b)} >
                         {map(sprints, (sprint) => this.renderSprintRow(sprint, active_headers))}
                       </DivTable>
                   )}
                </MienListColumnConfigurable>
            </div>
        )
    }

    renderHeader = (header_list) => {
        return (
            <DivTableHeaderRow>
              { map(header_list, (v, index) => (
                  <DivTableHeaderCell key={index}
                                      extra_style={getCellStyle(v)}>
                    { v.key !== "name" && v.label }
                  </DivTableHeaderCell>
              ))}
            </DivTableHeaderRow>
        )
    }
}

function mapStateToProps(state, props) {
    const { list_key, project_id } = props
    const sprint_list_key = list_key
    const deadline_list_key = LIST_KEY__SPRINT_DEADLINE
    const roadmap_list_key = LIST_KEY__SPRINT_ROADMAP
    const cost_summary_list_key = LIST_KEY__SPRINT_COST_SUMMARY
    const sprint_ids = getVisibleItemIds(state, sprint_list_key)
    const sprints = getVisibleItems(state, sprint_list_key, ENTITY_KEY__SPRINT)
    const sprint_roadmap_ids = getSprintRoadmapIdsFromSprintIds(sprint_ids)
    const sprint_roadmaps_by_id = getSprintRoadmapsById(state, sprint_roadmap_ids)
    const is_loading = isLoading(state, sprint_list_key) || getLoadingItemIds(state, sprint_list_key).length > 0 || !haveItemsBeenRetrieved(state, sprint_ids, ENTITY_KEY__SPRINT)
    const sprint_width_mode = getSprintWidthMode(state, sprint_list_key)
    const sprint_deadline_ids = flatMap(sprints, (sprint) => get(sprint, "deadline_ids", []))
    const sprint_deadlines_by_id = getSprintDeadlinesById(state, sprint_deadline_ids)
    const cost_summary_ids = getVisibleItemIds(state, cost_summary_list_key)
    const cost_summaries_by_id = getCostSummariesById(state, cost_summary_ids)
    const all_feature_ids = flatMap(values(sprint_roadmaps_by_id), (sprint_roadmap) => get(sprint_roadmap, "feature_ids", []))
    const features_by_id = getFeaturesById(state, all_feature_ids)

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
        all_feature_ids,
        features_by_id,
        can_view_budget,
        show_money,
        num_business_hours_per_day: getSetting(state, 'NUM_BUSINESS_HOURS_PER_DAY') || 8
    }
}

export default connect(mapStateToProps)(ProjectRoadmap)

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import moment from 'moment'
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
    getSprintDeadlinesById
} from '../actions/SprintDeadlines'
import {
    ENTITY_KEY__SPRINT
} from '../actions/ItemListKeyRegistry'
import {
    fetchSprintsIfNeeded
} from '../actions/Sprints'
import SprintName from './SprintName'
import Timestamp from './Timestamp'
import SprintDeadline from './SprintDeadline'

class ProjectRoadmap extends Component {
    
    componentDidMount() {
	const { dispatch, list_key, deadline_list_key, project_id, roadmap_list_key } = this.props
        if (project_id) {
            dispatch(initList(list_key))
            dispatch(update_list_filter(list_key, {project_id: project_id}))
            dispatch(update_list_format(list_key, {roadmap: true}))
            dispatch(fetchSprintsIfNeeded(list_key))
            dispatch(update_list_filter(deadline_list_key, {project_id: project_id}))
            dispatch(fetchSprintDeadlinesIfNeeded(deadline_list_key))

            dispatch(update_list_filter(roadmap_list_key, {project_id: project_id}))
            dispatch(fetchSprintRoadmapsIfNeeded(roadmap_list_key))
        }
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, list_key, roadmap_list_key} = this.props
        const { project_id } = new_props
        if ( project_id !== this.props.project_id ) {
            dispatch(update_list_filter(list_key, {project_id: project_id}))
            dispatch(update_list_filter(roadmap_list_key, {project_id: project_id}))
            dispatch(invalidateList(list_key))
            dispatch(invalidateList(roadmap_list_key))
        }
        if (project_id) {
            dispatch(fetchSprintsIfNeeded(list_key))
            dispatch(fetchSprintRoadmapsIfNeeded(roadmap_list_key))
        }
    }

    getSprintDimensions(sprint) {
        const { sprint_width_mode, sprint_roadmaps_by_id, num_business_hours_per_day } = this.props
        const sprint_roadmap = sprint_roadmaps_by_id[sprint.id] || {}
        
        const dimensions = {start: moment(),
                            end: moment(),
                            width: null}
        
        switch(sprint_width_mode) {
            case 'clock':
                dimensions.start = (sprint.first_entry && moment(sprint.first_entry.start_time)) || moment()
                dimensions.end = (sprint.last_entry && moment(sprint.last_entry.end_time)) || moment()
                dimensions.width_days = dimensions.end.diff(dimensions.start, 'days')
                break
            case 'deadline':
                dimensions.start = (sprint_roadmap.first_deadline_at && moment(sprint_roadmap.first_deadline_at)) || moment()
                dimensions.end = (sprint_roadmap.last_deadline_at && moment(sprint_roadmap.last_deadline_at)) || moment()
                dimensions.width_days = dimensions.end.diff(dimensions.start, 'days')
                break
            case 'estimate':
                const average_estimate_hours = ((sprint_roadmap.slowest_estimated_hours || 0)*1.0 + (sprint_roadmap.fastest_estimated_hours|| 0))/2
                dimensions.width_days = Math.round(average_estimate_hours / num_business_hours_per_day)
                break
            default:
                break
        }

        if ( this.project_roadmap_el ) {
            const max_width = this.project_roadmap_el.clientWidth;
            dimensions.width_percentage = (dimensions.width_days / max_width) * 100 + "%"
        } else {
            dimensions.width_percentage = "0%"
        }
        
        return dimensions
    }

    renderSprintContent__ActualDuration(sprint, dimensions) {
        return (
            <div>
              { sprint.first_entry &&
                <div className="project-roadmap__sprint-time-entry">
                  First clock: <Timestamp value={sprint.first_entry.start_time} format="datetime" />
                </div>
              }
              { sprint.last_entry &&
                <div className="project-roadmap__sprint-time-entry">
                  Last clock: <Timestamp value={sprint.last_entry.end_time} format="datetime" />
                </div>
              }
              { !sprint.last_entry &&
                <div>
                  No clocked time yet
                </div>
              }
            </div>
        )
    }

    renderSprintContent__Deadline(sprint, dimensions) {
        return (
            <div>
              { map(sprint.deadline_ids, function(deadline_id) {
                    return (
                        <div key={deadline_id}>
                          <SprintDeadline deadline_id={deadline_id} />
                        </div>
                    )
                })
              }
            </div>
        )
    }

    renderSprintContent__Estimate(sprint, dimensions) {
        return (
            <div>
              { dimensions.width_days &&
                <div>Total sprint estimate</div>
              }
              { !dimensions.width_days &&
                <div>No estimate</div>
              }
            </div>
        )
    }

    renderSprint(sprint) {
        const { sprint_width_mode } = this.props
        const dimensions = this.getSprintDimensions(sprint)
        
        return (
            <div key={sprint.id} className="project-roadmap__sprint">
              <div className="project-roadmap__sprint-fixed-content">
                <div className="project-roadmap__sprint-heading">
                  <SprintName sprint_id={sprint.id} />
                  <div className="project-roadmap__sprint-heading-status">
                    - { sprint.status_name }
                  </div>
                </div>
                { sprint_width_mode==='clock' && this.renderSprintContent__ActualDuration(sprint, dimensions) }
                { sprint_width_mode==='deadline' && this.renderSprintContent__Deadline(sprint, dimensions) }
                { sprint_width_mode==='estimate' && this.renderSprintContent__Estimate(sprint, dimensions) }
              </div>
              <div className="project-roadmap__sprint-variable-content" style={{width:dimensions.width_percentage||0}}>
                { dimensions.width_days>0 &&
                  <div className="project-roadmap__duration_text">
                    {dimensions.width_days} days
                  </div>
                }
              </div>
            </div>
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
            <div className="project-roadmap"
                 ref={ (el) => this.project_roadmap_el = el }>
              {map(sprints, (sprint) => this.renderSprint(sprint))}
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { list_key, project_id } = props
    const deadline_list_key = list_key + "_DEADLINES"
    const sprint_ids = getVisibleItemIds(state, list_key)
    const sprints = getVisibleItems(state, list_key, ENTITY_KEY__SPRINT)
    const sprint_roadmap_ids = getSprintRoadmapIdsFromSprintIds(sprint_ids)
    const sprint_roadmaps_by_id = getSprintRoadmapsById(state, sprint_roadmap_ids)
    const is_loading = isLoading(state, list_key) || getLoadingItemIds(state, list_key).length > 0 || !haveItemsBeenRetrieved(state, sprint_ids, ENTITY_KEY__SPRINT)
    const sprint_width_mode = getSprintWidthMode(state, list_key)
    const sprint_deadline_ids = getVisibleItemIds(deadline_list_key)
    const sprint_deadlines_by_id = getSprintDeadlinesById(state, sprint_deadline_ids)
    
    return {
        project_id,
        sprint_ids,
        sprint_roadmaps_by_id,
        sprints,
        is_loading,
        sprint_width_mode,
        list_key,
        deadline_list_key,
        sprint_deadlines_by_id,
        num_business_hours_per_day: getSetting(state, 'NUM_BUSINESS_HOURS_PER_DAY') || 8
    }
}

export default connect(mapStateToProps)(ProjectRoadmap)

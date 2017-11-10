import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import moment from 'moment'
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
import { getSprintWidthMode } from '../actions/ProjectRoadmap'
import { setSprintWidthMode  } from '../actions/ProjectRoadmap'
import {
    ENTITY_KEY__SPRINT
} from '../actions/ItemListKeyRegistry'
import {
    invalidateAllSprints,
    fetchSprintsIfNeeded,
} from '../actions/Sprints'
import SprintName from './SprintName'
import Timestamp from './Timestamp'

class ProjectRoadmap extends Component {

    constructor(props) {
        super(props)
    }
    
    componentDidMount() {
	const { dispatch, list_key, project_id } = this.props
        if (project_id) {
            dispatch(initList(list_key))
            dispatch(update_list_filter(list_key, {project_id: project_id}))
            dispatch(update_list_format(list_key, {roadmap: true}))
            dispatch(fetchSprintsIfNeeded(list_key))
        }
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, list_key} = this.props
        const { project_id } = new_props
        if ( project_id != this.props.project_id ) {
            dispatch(update_list_filter(list_key, {project_id: project_id}))
            dispatch(invalidateList(list_key))
        }
        if (project_id) {
            dispatch(fetchSprintsIfNeeded(list_key))
        }
    }

    getSprintDimensions(sprint) {
        const { sprint_width_mode } = this.props

        const dimensions = {start: moment(),
                            end: moment(),
                            width: null}
        
        switch(sprint_width_mode) {
            case 'clock':
                dimensions.start = (sprint.first_entry && moment(sprint.first_entry.start_time)) || moment()
                dimensions.end = (sprint.last_entry && moment(sprint.last_entry.end_time)) || moment()
            
        }
        dimensions.width_days = dimensions.end.diff(dimensions.start, 'days')

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
                <div>
                  First clock: <Timestamp value={sprint.first_entry.start_time} format="datetime" />
                </div>
              }
              { sprint.last_entry &&
                <div>
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

    renderSprint(sprint) {
        const { sprint_width_mode } = this.props
        const dimensions = this.getSprintDimensions(sprint)
        
        return (
            <div key={sprint.id} className="project-roadmap__sprint">
              <div>
                <SprintName sprint_id={sprint.id} />
                { sprint_width_mode=='clock' && this.renderSprintContent__ActualDuration(sprint, dimensions) }
              </div>
              <div className="project-roadmap__duration" style={{width:dimensions.width_percentage}}>
                {dimensions.width_days} days
              </div>
            </div>
        )
    }

    render() {

        const { is_loading, sprints } = this.props
        const that = this

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
    const sprint_ids = getVisibleItemIds(state, list_key)
    const sprints = getVisibleItems(state, list_key, ENTITY_KEY__SPRINT)
    const is_loading = isLoading(state, list_key) || getLoadingItemIds(state, list_key).length > 0 || !haveItemsBeenRetrieved(state, sprint_ids, ENTITY_KEY__SPRINT)
    const sprint_width_mode = getSprintWidthMode(state, list_key)
    
    return {
        project_id,
        sprint_ids,
        sprints,
        is_loading,
        sprint_width_mode
    }
}

export default connect(mapStateToProps)(ProjectRoadmap)

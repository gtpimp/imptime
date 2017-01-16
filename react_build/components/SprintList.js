import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import map from 'lodash/map'
import {
    invalidateList,
    selectItems,
    collapse_list,
    expand_list
} from '../actions/ItemList'
import {
    invalidateAllSprints,
    fetchSprintsIfNeeded,
    reorderSprints
} from '../actions/Sprints'
import Pagination from '../components/Pagination'
import Sprint from './Sprint'
import { Sticky } from 'react-sticky';

class SprintList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
	this.onChangePage = this.onChangePage.bind(this)
	this.onCollapse = this.onCollapse.bind(this)
	this.onExpand = this.onExpand.bind(this)
	this.onClickedSprint = this.onClickedSprint.bind(this)
	this.reorderSprints = this.reorderSprints.bind(this)
    }

    componentDidMount() {
	const { dispatch, list_key, project_id } = this.props
	if ( project_id ) {
	    dispatch(fetchSprintsIfNeeded(list_key))
	}
    }

    onCollapse() {
	const { dispatch, list_key } = this.props
	dispatch(collapse_list(list_key))
    }

    onExpand() {
	const { dispatch, list_key } = this.props
	dispatch(expand_list(list_key))
    }

    onClickedSprint(sprint_id) {
	const { dispatch, list_key } = this.props
	dispatch(selectItems(list_key, [sprint_id]))
    }

    onChangePage() {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(fetchSprintsIfNeeded(list_key))
    }
    
    onRefresh(event) {
        const { dispatch, sprint_ids, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(invalidateAllSprints())
	dispatch(fetchSprintsIfNeeded(list_key))
	if ( event ) {
	    event.stopPropagation()
	}
    }

    reorderSprints(moving_sprint_id, move_after_sprint_id) {
	const { dispatch, list_key } = this.props
	dispatch(reorderSprints(moving_sprint_id, move_after_sprint_id,
				function() {
				    dispatch(invalidateList(list_key))
				    dispatch(fetchSprintsIfNeeded(list_key))
				}))
    }

    renderCollapsedSprint(sprint) {
	const { list_key } = this.props
	return (
	    <div key={"collapsed_sprint_"+sprint.id+"_"+list_key}>
		Sprint: {sprint.name}
	    </div>
	)
    }
    
    render_collapsed() {
	const { sprint, selected_items, is_collapsed, selected_ids, reorderSprints,
		loading_item_ids, list_key } = this.props

	return (
	    <div className="panel panel--collapsed">
		    <div className="panel-heading" onClick={this.onExpand}>
			<div className="panel__title">
			    { selected_items.map((sprint, index) =>
				<Sprint key={list_key+sprint.id+index} 
					is_collapsed={true}
					reorderSprints={reorderSprints}
					onClickedSprint={() => this.onClickedSprint(sprint.id)}
					is_loading={loading_item_ids.indexOf(sprint.id) !== -1}
					is_selected={selected_ids.indexOf(sprint.id) !== -1}
					sprint_id={sprint.id} />
			      )}
			</div>
		    </div>
	    </div>
	)
    }

    render_expanded() {

        const { sprints, is_visible, list_key, is_loading,
		selected_ids, reorderSprints,
		loading_item_ids, has_items } = this.props

	return (
            <div style={{ opacity: is_loading ? 0.5 : 1 }}>
		<div className="panel panel--default">
		    <Sticky>
			<div className="panel-heading" onClick={this.onCollapse}>
			    <div className="panel__title">Sprints</div>
			    <div className="panel__buttons">
				<div className="panel__button panel__button--refresh"
				     onClick={this.onRefresh}></div>
			    </div>
			</div>
			<Pagination list_key={list_key} on_changed={this.onChangePage} /> 
		    </Sticky>
                    <div className="panel-body">
			<table className="table table--default" >
                            <tbody>
				{sprints.map( (sprint, index) =>
				    <Sprint key={list_key+"sprint.id"+index}
					    is_collapsed={false}
					    reorderSprints={this.reorderSprints}
					    onClickedSprint={() => this.onClickedSprint(sprint.id)}
					    is_loading={loading_item_ids.indexOf(sprint.id) !== -1}
					    is_selected={selected_ids.indexOf(sprint.id) !== -1}
					    sprint_id={sprint.id}
				    />
				 )}
                            </tbody>
			</table>
			{ !is_loading && !has_items &&
			  <div className="table__no-rows">no sprints</div>
			}
                    </div>
		</div>

            </div>
        )
    }

    render() {
        const { is_visible, is_loading, is_collapsed, is_expanded } = this.props

	return (
	    <div>
		{ is_collapsed && this.render_collapsed() }
		{ is_expanded && this.render_expanded() }
	    </div>
	)
    }
}

function mapStateToProps(state, props) {
    const { sprint, item_list } = state
    const { list_key } = props
    const items_by_id = sprint && sprint.items_by_id || {}
    const l = (item_list && item_list[list_key]) || {}
    const filter = l.filter || {}
    const project_id = filter.project_id || null
    const visible_item_ids = l.visible_item_ids || []

    const selected_items = items_by_id && l.selected_ids && l.selected_ids.map( function(selected_id, index) {
	return items_by_id[selected_id] || { 'id': selected_id,
					     'loaded': false }
    })
    
    const items = (items_by_id && visible_item_ids.map( function(visible_item_id, index) {
	return items_by_id[visible_item_id] || { 'id': visible_item_id,
						 'loaded': false }
    })) || []
    
    return {
        list_key: list_key,
	project_id: project_id,
        sprints: items,
	sprint_ids: map(items, 'id'),
	selected_ids: l.selected_ids || [],
	selected_items: selected_items || [],
	loading_item_ids: l.loading_item_ids || [],
        has_items: items && items.length > 0,
	is_visible: project_id || false,
        is_loading: l.is_loading,
	is_collapsed: l.display_mode == "collapsed",
	is_expanded: l.display_mode == "expanded" || !l.display_mode,
        last_updated: l.last_updated,
	is_visible: project_id || false
    }
}

export default connect(mapStateToProps)(SprintList)

import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import {
    invalidateList,
    selectItems,
    collapse_list,
    expand_list
} from '../actions/ItemList'
import { fetchSprintsIfNeeded } from '../actions/Sprints'
import Pagination from '../components/Pagination'


export class SprintList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
	this.onCollapse = this.onCollapse.bind(this)
	this.onExpand = this.onExpand.bind(this)
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

    onRefresh() {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(fetchSprintsIfNeeded(list_key))
    }

    renderCollapsedSprint(sprint) {
	const { list_key } = this.props
	return (
	    <div key={"collapsed_sprint_"+sprint.id+"_"+list_key}>
		{sprint.id}
		{sprint.name}
	    </div>
	)
    }
    
    render_collapsed() {
	const { sprints, selected_items } = this.props

	return (
	    <div className="panel panel--collapsed">
		<div className="panel-heading" onClick={this.onExpand}>
		    <div className="panel__title">
			{ selected_items.map((sprint, index) => this.renderCollapsedSprint(sprint)) }
		    </div>
		</div>
	    </div>
	)
    }

    renderExpandedSprint(sprint, index) {
        const { selected_ids } = this.props

	let selected = selected_ids.indexOf(sprint.id) !== -1
	
        return (
	    <tr key={sprint.id+"."+index}
		onClick={() => this.onClickedSprint(sprint.id)}
		className={selected ? 'tr--selected' : ''}
	    >
		<td>{sprint.id}</td>
	        { sprint.loaded === false &&
		<td>Loading...</td>
		}
		{ sprint.loaded !== false &&
		  <td>{sprint.name}</td>
		}
	    </tr>
        )
    }

    render_expanded() {

        const { sprints, is_visible, list_key, is_loading, has_items } = this.props

	if ( ! is_visible ) {
	    return (<div></div>)
	}
	
        return (
            <div style={{ opacity: is_loading ? 0.5 : 1 }}>
		<div className="panel panel--full">
                    <div className="panel-heading" onClick={this.onCollapse}>
			<div className="panel__title">Sprints</div>
			<div className="panel__button panel__button--collapse">
			</div>
			<div className="panel__buttons">
                            <div className="panel__button panel__button--refresh"
				 onClick={this.onRefresh}></div>
			</div>
                    </div>
                    <div className="panel-body">
			<table className="table table--default" >
                            <thead>
				<tr>
				    <th>ID</th>
				    <th>Name</th>
				</tr>
                            </thead>
                            <tbody>
				{sprints.map((sprint, index) => this.renderExpandedSprint(sprint, index))}
                            </tbody>
			</table>
			{ !is_loading && !has_items &&
			  <div className="table__no-rows">no sprints</div>
			}
                    </div>
		</div>

		<Pagination list_key={list_key} on_changed={this.onRefresh} />
            </div>
        )
    }

    render() {
        const { is_loading, is_collapsed, is_expanded } = this.props

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
	selected_ids: l.selected_ids || [],
	selected_items: selected_items || [],
        has_items: items && items.length > 0,
	is_visible: project_id || false,
        is_loading: l.is_loading,
	is_collapsed: l.display_mode == "collapsed",
	is_expanded: l.display_mode == "expanded" || !l.display_mode,
        last_updated: l.last_updated
    }
}

export default connect(mapStateToProps)(SprintList)

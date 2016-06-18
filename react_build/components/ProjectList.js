import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { invalidateList, selectItems } from '../actions/ItemList'
import { fetchProjectsIfNeeded } from '../actions/Projects'
import Pagination from '../components/Pagination'


export class ProjectList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
    }

    componentDidMount() {
	const { dispatch, list_key } = this.props
	dispatch(fetchProjectsIfNeeded(list_key))
    }

    onClickedProject(project_id) {
	const { dispatch, list_key } = this.props
	dispatch(selectItems(list_key, [project_id]))
    }

    onRefresh() {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(fetchProjectsIfNeeded(list_key))
    }

    renderProject(project, index) {
        const { selected_ids } = this.props

	let selected = selected_ids.indexOf(project.id) !== -1
	
        return (
	    <tr key={project.id+"."+index}
		onClick={() => this.onClickedProject(project.id)}
		className={selected ? 'tr--selected' : ''}
	    >
		<td>{project.id}</td>
	        { project.loaded === false &&
		<td>Loading...</td>
		}
		{ project.loaded !== false &&
		  <td>{project.name}</td>
		}
	    </tr>
        )
    }

    render() {

        const { projects, list_key, is_loading, has_items } = this.props

        return (
            <div style={{ opacity: is_loading ? 0.5 : 1 }}>
		<div className="panel panel--wide">
                    <div className="panel-heading">
			<div className="panel__title">Projects</div>
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
				{projects.map((project, index) => this.renderProject(project, index))}
                            </tbody>
			</table>
			{ !is_loading && !has_items &&
			  <div className="table__no-rows">no projects</div>
			}
                    </div>
		</div>

		<Pagination list_key={list_key} on_changed={this.onRefresh} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { project, item_list } = state
    const { list_key } = props
    const items_by_id = project && project.items_by_id || {}
    const l = (item_list && item_list[list_key]) || {}
    const visible_item_ids = l.visible_item_ids || []
    
    const items = (items_by_id && visible_item_ids.map( function(visible_item_id, index) {
	return items_by_id[visible_item_id] || { 'id': visible_item_id,
						 'loaded': false }
    })) || []
    
    return {
        list_key: list_key,
        projects: items,
	selected_ids: l.selected_ids || [],
        has_items: items && items.length > 0,
        is_loading: l.is_loading,
        last_updated: l.last_updated
    }
}

export default connect(mapStateToProps)(ProjectList)

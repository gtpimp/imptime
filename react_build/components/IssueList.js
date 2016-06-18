import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { invalidateList, selectItems } from '../actions/ItemList'
import { fetchIssuesIfNeeded } from '../actions/Issues'
import Pagination from '../components/Pagination'


export class IssueList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
    }

    componentDidMount() {
	const { dispatch, list_key, sprint_id } = this.props
	if ( sprint_id ) {
	    dispatch(fetchIssuesIfNeeded(list_key))
	}
    }

    onClickedIssue(issue_id) {
	const { dispatch, list_key } = this.props
	dispatch(selectItems(list_key, [issue_id]))
    }

    onRefresh() {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(fetchIssuesIfNeeded(list_key))
    }

    renderIssue(issue, index) {
        const { selected_ids } = this.props

	let selected = selected_ids.indexOf(issue.id) !== -1
	
        return (
	    <tr key={issue.id+"."+index}
		onClick={() => this.onClickedIssue(issue.id)}
		className={selected ? 'tr--selected' : ''}
	    >
		<td>{issue.number}</td>
	        { issue.loaded === false &&
		<td>Loading...</td>
		}
		{ issue.loaded !== false &&
		  <td>{issue.subject}</td>
		}
	    </tr>
        )
    }

    render() {

        const { issues, list_key, is_loading, has_items } = this.props

        return (
            <div style={{ opacity: is_loading ? 0.5 : 1 }}>
		<div className="panel panel--wide">
                    <div className="panel-heading">
			<div className="panel__title">Issues</div>
			<div className="panel__buttons">
                            <div className="panel__button panel__button--refresh"
				 onClick={this.onRefresh}></div>
			</div>
                    </div>
                    <div className="panel-body">
			<table className="table table--default" >
                            <thead>
				<tr>
				    <th>Number</th>
				    <th>Name</th>
				</tr>
                            </thead>
                            <tbody>
				{issues.map((issue, index) => this.renderIssue(issue, index))}
                            </tbody>
			</table>
			{ !is_loading && !has_items &&
			  <div className="table__no-rows">no issues</div>
			}
                    </div>
		</div>

		<Pagination list_key={list_key} on_changed={this.onRefresh} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue, item_list } = state
    const { list_key } = props
    const items_by_id = issue && issue.items_by_id || {}
    const l = (item_list && item_list[list_key]) || {}

    const filter = l.filter || {}
    
    const sprint_id = filter.sprint_id || null
    const visible_item_ids = l.visible_item_ids || []
    
    const items = (items_by_id && visible_item_ids.map( function(visible_item_id, index) {
	return items_by_id[visible_item_id] || { 'id': visible_item_id,
						 'loaded': false }
    })) || []
    
    return {
        list_key: list_key,
	sprint_id: sprint_id,
        issues: items,
	selected_ids: l.selected_ids || [],
        has_items: items && items.length > 0,
        is_loading: l.is_loading,
        last_updated: l.last_updated
    }
}

export default connect(mapStateToProps)(IssueList)

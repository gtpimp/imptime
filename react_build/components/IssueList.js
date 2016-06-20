import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { invalidateList,
	 selectItems,
	 collapse_list,
	 expand_list
} from '../actions/ItemList'
import { fetchIssuesIfNeeded } from '../actions/Issues'
import {
    updateIssueSubject
} from '../actions/Issue'
import Pagination from '../components/Pagination'
import { RIEInput } from 'riek'

export class IssueList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
	this.onCollapse = this.onCollapse.bind(this)
	this.onExpand = this.onExpand.bind(this)
	this.onChangeSubject = this.onChangeSubject.bind(this)
    }

    componentDidMount() {
	const { dispatch, list_key, sprint_id } = this.props
	if ( sprint_id ) {
	    dispatch(fetchIssuesIfNeeded(list_key))
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

    onClickedIssue(issue_id) {
	const { dispatch, list_key } = this.props
	dispatch(selectItems(list_key, [issue_id]))
    }

    onRefresh(event) {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(fetchIssuesIfNeeded(list_key))
	if ( event ) {
	    event.stopPropagation()
	}
    }

    onChangeSubject(issue_id, obj) {
	const { dispatch } = this.props
	dispatch(updateIssueSubject(issue_id, obj.subject))
    }

    renderCollapsedIssue(issue) {
	const { list_key } = this.props
	return (
	    <div key={"collapsed_issue_"+issue.id+"_"+list_key}>
		{issue.number}
		{issue.subject}
	    </div>
	)
    }
    
    render_collapsed() {
	const { issues, selected_items } = this.props

	return (
	    <div className="panel panel--collapsed">
		<div className="panel-heading"  onClick={this.onExpand}>
		    <div className="panel__title">{ selected_items.map((issue, index) => this.renderCollapsedIssue(issue)) }</div>
		</div>
	    </div>
	)
    }
    
    renderExpandedIssue(issue, index) {
        const { selected_ids } = this.props

	let selected = selected_ids.indexOf(issue.id) !== -1

	if ( issue.loaded === false ) {
	    return (
		<tr key={issue.id+"."+index}
		    onClick={() => this.onClickedIssue(issue.id)}
		    className={selected ? 'tr--selected' : ''}
		>
		    <td>{issue.number}</td>
		    <td>Loading...</td>
		</tr>
	    )
	}
	if ( ! issue.loaded !== false ) {
	    return (
		<tr key={issue.id+"."+index}
		    onClick={() => this.onClickedIssue(issue.id)}
		    className={selected ? 'tr--selected' : ''}
		>
		    <td className="issue_list__tr__issue_number_button" >{issue.number}</td>
		    <td>
			<RIEInput value={issue.subject}
				  propName="subject" 
				  change={(obj) => this.onChangeSubject(issue.id, obj)} />
		    </td>
		    <td>{issue.assigned_to_username}</td>
		    <td>{issue.feature_name}</td>
		    <td>{issue.status}</td>
		</tr>
	    )
	}
    }
    
    render_expanded() {
	const { is_loading, issues, has_items, list_key } = this.props
        return (
            <div className="issue_list" style={{ opacity: is_loading ? 0.5 : 1 }}>
		<div className="panel panel--full">
                    <div className="panel-heading" onClick={this.onCollapse}>
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
				    <th>Assigned to</th>
				    <th>Feature</th>
				    <th>Status</th>
				</tr>
                            </thead>
                            <tbody>
				{issues.map((issue, index) => this.renderExpandedIssue(issue, index))}
                            </tbody>
			</table>
			{ !is_loading && !has_items &&
			  <div className="table__no-rows">no issues</div>
			}
                    </div>
		    <Pagination list_key={list_key} on_changed={this.onRefresh} />
		</div>

            </div>
        )
    }

    render() {

        const { is_visible, is_loading, is_collapsed, is_expanded } = this.props

	if ( ! is_visible ) {
	    return (<div></div>)
	}
	
	return (
	    <div>
		{ is_collapsed && this.render_collapsed() }
		{ is_expanded && this.render_expanded() }
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
	sprint_id: sprint_id,
        issues: items,
	selected_ids: l.selected_ids || [],
	selected_items: selected_items || [],
        has_items: items && items.length > 0,
        is_loading: l.is_loading,
	is_collapsed: l.display_mode == "collapsed",
	is_expanded: l.display_mode == "expanded" || !l.display_mode,
        last_updated: l.last_updated,
	is_visible: sprint_id || false
    }
}

export default connect(mapStateToProps)(IssueList)

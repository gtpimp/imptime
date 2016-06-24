import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import map from 'lodash/map'
import RIEInput from '../widgets/RIEInput'
import { connect } from 'react-redux'
import {
    invalidateList,
    selectItems,
    collapse_list,
    expand_list
} from '../actions/ItemList'
import {
    invalidateIssues,
    fetchIssuesIfNeeded,
} from '../actions/Issues'
import {
    reorderIssue,
    startCandidateIssue,
    updateCandidateSubject,
    cancelCandidateIssue,
    saveCandidateIssue
} from '../actions/Issue'
import Pagination from '../components/Pagination'
import Issue from './Issue'

export class IssueList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
	this.onChangePage = this.onChangePage.bind(this)	
	this.onCollapse = this.onCollapse.bind(this)
	this.onExpand = this.onExpand.bind(this)
	this.onClickedIssue = this.onClickedIssue.bind(this)
	this.reorderIssue = this.reorderIssue.bind(this)
	this.onStartCandidateIssue = this.onStartCandidateIssue.bind(this)
	this.onSaveCandidateIssue = this.onSaveCandidateIssue.bind(this)
	this.onCancelCandidateIssue = this.onCancelCandidateIssue.bind(this)
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

    onChangePage() {
        const { dispatch, issue_ids, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(fetchIssuesIfNeeded(list_key))
    }
    
    onRefresh(event) {
        const { dispatch, issue_ids, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(invalidateIssues(issue_ids))
	dispatch(fetchIssuesIfNeeded(list_key))
	if ( event ) {
	    event.stopPropagation()
	}
    }

    onStartCandidateIssue(event) {
	const { dispatch, list_key } = this.props
	event.stopPropagation()
	dispatch(startCandidateIssue(list_key))
    }

    onSaveCandidateIssue(obj) {
	const { dispatch } = this.props
	dispatch(updateCandidateSubject(obj.candidate_issue_subject))
	dispatch(saveCandidateIssue())
    }

    onCancelCandidateIssue() {
	const { dispatch } = this.props
	dispatch(cancelCandidateIssue())
    }

    reorderIssue(moving_issue_id, move_after_issue_id) {
	const { dispatch, list_key } = this.props
	console.log("Moving " + moving_issue_id + " to after " + move_after_issue_id)
	dispatch(reorderIssue(moving_issue_id, move_after_issue_id,
			      function() {
				  dispatch(invalidateList(list_key))
				  dispatch(fetchIssuesIfNeeded(list_key))
			      }))
    }
    
    render_collapsed() {
	
	const { issue, selected_items, is_collapsed, selected_ids, loading_item_ids, list_key } = this.props

	return (
	    <div className="panel panel--collapsed">
		<div className="panel-heading"  onClick={this.onExpand}>
		    <div className="panel__title">{ selected_items.map((issue, index) =>
			<Issue
			    key={list_key+issue.id+index}
			    is_collapsed={true}
			    reorderIssue={this.reorderIssue}
			    onClickedIssue={() => this.onClickedIssue(issue.id)}
			    is_loading={loading_item_ids.indexOf(issue.id) !== -1}
			    is_loading={selected_ids.indexOf(issue.id) !== -1}
			    issue_id={issue.id} />
			)}
		    </div>
		</div>
	    </div>
	)
    }

    render_candidate_issue() {

	const { candidate_issue, list_key  } = this.props

	return (
	    <tr key={list_key+".candidate_issue"} className="issue_list__candidate_issue">
		<td>New issue</td>
		<td>
		    <RIEInput value=""
			      propName="candidate_issue_subject"
			      initialState="editing"
			      change={this.onSaveCandidateIssue}
		              cancel={this.onCancelCandidateIssue} />
		</td>
	    </tr>
	)
    }
    
    render_expanded() {
	
	const { issues, is_visible, list_key, is_loading,
		is_creating_issue, candidate_issue,
		selected_ids, loading_item_ids, has_items } = this.props

	if ( ! is_visible ) {
	    return (<div></div>)
	}
	const that = this

	const issue_rows = []
	issues.map(function(issue, index) {

	    if (is_creating_issue && index==0 && !candidate_issue.issue_id_before) {
		issue_rows.push(that.render_candidate_issue())
	    }
	    
	    issue_rows.push(
		<Issue
		    key={list_key+issue.id+index}
		    is_collapsed={false}
		    reorderIssue={that.reorderIssue}
		    onClickedIssue={() => that.onClickedIssue(issue.id)}
		    is_loading={loading_item_ids.indexOf(issue.id) !== -1}
		    is_selected={selected_ids.indexOf(issue.id) !== -1}
		    issue_id={issue.id}
		/>
	    )
	    if ( is_creating_issue && candidate_issue.issue_id_before==issue.id ) {
		issue_rows.push(that.render_candidate_issue())
	    }
	})
	
        return (
            <div className="issue_list" style={{ opacity: is_loading ? 0.5 : 1 }}>
		<div className="panel panel--full">
                    <div className="panel-heading" onClick={this.onCollapse}>
			<div className="panel__title">Issues</div>
			<div className="panel__buttons">
                            <div className="panel__button panel__button--refresh"
				 onClick={this.onRefresh}>
			    </div>
                            <div className="panel__button panel__button--add"
				 onClick={this.onStartCandidateIssue}>
			    </div>			    
			</div>
                    </div>
                    <div className="panel-body">
			<table className="table table--compact" >
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
				{issue_rows}
                            </tbody>
			</table>
			{ !is_loading && !has_items &&
			  <div className="table__no-rows">no issues</div>
			}
                    </div>
		    <Pagination list_key={list_key} on_changed={this.onChangePage} />
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

    const candidate_issue = issue.candidate_issue
    const is_creating_issue = candidate_issue || false
    
    return {
        list_key: list_key,
	sprint_id: sprint_id,
        issues: items,
	issue_ids: map(items, 'id'),
	selected_ids: l.selected_ids || [],
	selected_items: selected_items || [],
	loading_item_ids: l.loading_item_ids || [],
        has_items: items && items.length > 0,
        is_loading: l.is_loading,
	is_collapsed: l.display_mode == "collapsed",
	is_expanded: l.display_mode == "expanded" || !l.display_mode,
        last_updated: l.last_updated,
	is_visible: sprint_id || false,
	candidate_issue: candidate_issue,
	is_creating_issue: is_creating_issue
    }
}

export default connect(mapStateToProps)(IssueList)

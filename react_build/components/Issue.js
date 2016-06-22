import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import map from 'lodash/map'
import { connect } from 'react-redux'
import {
    updateIssueSubject
} from '../actions/Issue'
import { RIEInput } from 'riek'

export class Issue extends Component {

    constructor(props) {
        super(props)
	this.onChangeSubject = this.onChangeSubject.bind(this)
    }
    
    onChangeSubject(issue_id, obj) {
	const { dispatch } = this.props
	dispatch(updateIssueSubject(issue_id, obj.subject))
    }

    render_collapsed() {
	const { issue, list_key } = this.props
	return (
	    <div key={"collapsed_issue_"+issue.id+"_"+list_key}>
		{issue.number}
		{issue.subject}
	    </div>
	)
    }
    
    render_expanded() {
        const { issue, is_loading, is_selected, onClickedIssue } = this.props

	if ( ! issue ) {
	    return (<tr><td>Loading...</td></tr>)
	}
	
	if ( issue.loaded === false ) {
	    return (
		<tr key={this.key+"."+issue.id}
		    onClick={onClickedIssue}
		    className={is_selected ? 'tr--selected' : ''}
		>
		    <td><div className="issue_list__issue_number_button">{issue.number}</div></td>
		    <td>Loading...</td>
		</tr>
	    )
	} else {
	    return (
		<tr key={this.key+"."+issue.id}
		    onClick={onClickedIssue}
		    className={is_selected ? 'tr--selected' : ''}
		>
		    <td>
			<div className="issue_list__issue_number_button">{issue.number}</div>
		    </td>
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

    render() {
        const { is_collapsed, is_expanded } = this.props

	if ( is_collapsed ) {
	    return this.render_collapsed()
	}
	else if ( is_expanded ) {
	    return this.render_expanded()
	} else {
	    return ( <div>Dev error</div> )
	}
    }

}

function mapStateToProps(state, props) {
    const { issue, item_list } = state
    const { issue_id, is_selected, is_collapsed, is_loading } = props

    const this_issue = (issue && issue.items_by_id && issue.items_by_id[issue_id]) || {'loaded':false}
    
    return {
	issue: this_issue,
	issue_id: issue_id,
	is_selected: is_selected,
	is_loading: is_loading,
	is_collapsed: is_collapsed,
	is_expanded: !is_collapsed
    }

}

export default connect(mapStateToProps)(Issue)

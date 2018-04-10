import React, { Component } from 'react'
import { connect } from 'react-redux'
import {withRouter, Link} from 'react-router-dom'

class IssueLink extends Component {

    render() {
        const { project_id, sprint_id, issue_id, issue_number } = this.props
        return ( 
            <Link to={'/projects/' + project_id + '/sprints/' + sprint_id + '/issues/' + issue_id}
                  className="issue_link">
	      #{issue_number}
	    </Link>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue_id, sprint_id, project_id, issue_number } = props

    return {
        issue_id: issue_id,
        sprint_id: sprint_id,
        project_id: project_id,
        issue_number: issue_number
    }
}

export default withRouter(connect(mapStateToProps)(IssueLink))

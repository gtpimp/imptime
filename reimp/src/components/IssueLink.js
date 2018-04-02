import React, { Component } from 'react'
import { connect } from 'react-redux'
import {withRouter} from 'react-router'

class IssueLink extends Component {

    constructor(props) {
        super(props)
        this.on_clicked = this.on_clicked.bind(this)
    }
    
    on_clicked(event) {
        const { issue_id, history, sprint_id, project_id, onClick, open_on_click } = this.props
        event.stopPropagation()
        if ( onClick ) {
            onClick(sprint_id, project_id, issue_id)
        } else if ( open_on_click ) {
            history.push('/projects/' + project_id + '/sprints/' + sprint_id + '/issues/' + issue_id);
        }
    }
    
    render() {
        const { issue_id, issue_number, onClick } = this.props

        return (
            <div className="issue_link" onClick={this.on_clicked}>
	      #{issue_number}
	    </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue_id, sprint_id, project_id, issue_number } = props

    return {
        issue_id: issue_id,
        sprint_id: sprint_id,
        project_id: project_id,
        issue_number: issue_number,
        onClick: props.onClick,
        open_on_click: props.open_on_click || true
    }
}

export default connect(mapStateToProps)(withRouter(IssueLink))

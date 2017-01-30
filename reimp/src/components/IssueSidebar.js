import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'

class IssueSidebar extends Component {

    constructor(props) {
        super(props)
        this.navigateToIssuesPage = this.navigateToIssuesPage.bind(this)
    }

    navigateToIssuesPage() {
        const { project_id, sprint_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_id+'/issues');
    }

    render() {

        const { issue_id } = this.props
        
        return (

            <div>
                I am your issues sidebar for {issue_id}
                                
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue_id, sprint_id, project_id } = props
    return {
        issue_id: issue_id,
        sprint_id: sprint_id,
        project_id: project_id
    }
}

export default connect(mapStateToProps)(IssueSidebar)


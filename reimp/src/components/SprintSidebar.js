import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'

class SprintSidebar extends Component {

    constructor(props) {
        super(props)
        this.navigateToIssuesPage = this.navigateToIssuesPage.bind(this)
    }

    navigateToIssuesPage() {
        const { project_id, sprint_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_id+'/issues');
    }

    render() {

        const { sprint_id } = this.props
        
        return (
            <div className="sprint_sidebar">
                Sprint {sprint_id}

                <pre>
                    I am your sprint sidebar
                </pre>
                
                <button onClick={this.navigateToIssuesPage}>Take me to your issues</button>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id, project_id } = props
    return {
        sprint_id: sprint_id,
        project_id: project_id
    }
}

export default connect(mapStateToProps)(SprintSidebar)


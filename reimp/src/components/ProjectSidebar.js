import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'

class ProjectSidebar extends Component {

    constructor(props) {
        super(props)
        this.navigateToSprintsPage = this.navigateToSprintsPage.bind(this)
    }

    navigateToSprintsPage() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints');
    }

    render() {

        const { project_id } = this.props
        
        return (
            <div className="project_sidebar">
                Project {project_id}

                <pre>
                    I am your project sidebar
                </pre>
                
                <button onClick={this.navigateToSprintsPage}>Take me to your sprints</button>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {} = state

    const { project_id } = props
    return {
        project_id: project_id
    }
}

export default connect(mapStateToProps)(ProjectSidebar)


import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'

class ProjectSidebar extends Component {

    constructor(props) {
        super(props)
        this.navigateToSprintsPage = this.navigateToSprintsPage.bind(this)
    }

    componentDidMount() {
	const { dispatch, project_id } = this.props
	if ( project_id ) {
	    dispatch(ensureProjectsLoaded([project_id]))
	}
    }

    componentWillReceiveProps() {
        const { dispatch, project_id } = this.props
	if ( project_id ) {
	    dispatch(ensureProjectsLoaded([project_id]))
	}
    }

    navigateToSprintsPage() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints');
    }

    render() {

        const { project_id, project } = this.props
        
        return (
            <div className="sidebar project_sidebar">
                <pre>
                    I am your project sidebar
                </pre>
                
                <button onClick={this.navigateToSprintsPage}>Take me to your sprints</button>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id } = props
    const project = getProject(state, project_id)
    return {
        project_id: project_id,
        project: project
    }
}

export default connect(mapStateToProps)(ProjectSidebar)

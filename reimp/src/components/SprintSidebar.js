import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import PropertyStack from '../components/PropertyStack'
import PropertyStackComponent from '../components/PropertyStackComponent'
import Timestamp from '../components/Timestamp'
import moment from 'moment'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'

class SprintSidebar extends Component {

    constructor(props) {
        super(props)
        this.navigateToIssuesPage = this.navigateToIssuesPage.bind(this)
    }

    componentDidMount() {
	const { dispatch, project_id, sprint_id } = this.props
	if ( project_id ) {
	    dispatch(ensureProjectsLoaded([project_id]))
	}
	if ( sprint_id ) {
	    dispatch(ensureSprintsLoaded([sprint_id]))
	}
    }

    componentWillReceiveProps() {
        const { dispatch, project_id, sprint_id } = this.props
	if ( project_id ) {
	    dispatch(ensureProjectsLoaded([project_id]))
	}
	if ( sprint_id ) {
	    dispatch(ensureSprintsLoaded([sprint_id]))
	}
    }

    navigateToIssuesPage() {
        const { project_id, sprint_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_id+'/issues');
    }

    render() {

        const { sprint_id, sprint, project } = this.props
        
        return (
            <div className="sprint_sidebar">
                <PropertyStack>
                    <PropertyStackComponent>
                        <div className="property--parent-title">
                            <div className="property-label-1">{project.name}</div>
                        </div>
                        <div className="property--title">
                            <div className="property-label-2">Sprinasdfdsafdasfdsafasfasfdasfasfasfdsaasfasft 3</div>
                        </div>
                    </PropertyStackComponent>
                    <PropertyStackComponent>
                        <div className="property-text">{sprint.description}
                        </div>
                    </PropertyStackComponent>
                    <PropertyStackComponent>
                        <div className="named-property">
                            <div className="named-property__name">Created</div>
                            <div className="named-property__value"><Timestamp format="short-date" value={moment()}/></div>
                        </div>
                    </PropertyStackComponent>
                    <PropertyStackComponent>
                        <div className="named-property">
                            <div className="named-property__name">First Activity</div>
                            <div className="named-property__value"><Timestamp format="short-date" value={moment()}/></div>
                        </div>
                    </PropertyStackComponent>
                </PropertyStack>

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
    const project = getProject(state, project_id)
    const sprint = getSprint(state, sprint_id)
    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project
    }
}

export default connect(mapStateToProps)(SprintSidebar)


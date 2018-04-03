import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import {withRouter} from 'react-router-dom'
import PropertyStack from '../components/PropertyStack'
import PropertyStackComponent from '../components/PropertyStackComponent'
import Timestamp from '../components/Timestamp'
import moment from 'moment'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint, cloneTemplateSprint} from '../actions/Sprints'
import EditableSprintName from '../components/EditableSprintName'
import EditableSprintStatus from '../components/EditableSprintStatus'
import EditableSprintType from '../components/EditableSprintType'
import SprintName from './SprintName'


class SprintTemplateSidebar extends Component {

    constructor(props) {
        super(props)
        this.navigateToIssuesPage = this.navigateToIssuesPage.bind(this)
        this.navigateToDashboardPage = this.navigateToDashboardPage.bind(this)
        this.cloneSprint = this.cloneSprint.bind(this)
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

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { project_id, sprint_id } = new_props
	if ( project_id ) {
	    dispatch(ensureProjectsLoaded([project_id]))
	}
	if ( sprint_id ) {
	    dispatch(ensureSprintsLoaded([sprint_id]))
	}
    }

    navigateToIssuesPage() {
        const { history, project_id, sprint_id } = this.props
        history.push('/projects/'+project_id+'/sprints/'+sprint_id+'/issues');
    }

    navigateToDashboardPage() {
        const { history, project_id, sprint_id } = this.props
        history.push('/projects/'+project_id+'/sprints/'+sprint_id);
    }

    cloneSprint() {
        const { dispatch, history, project_id, sprint_id } = this.props
        const onDone = function(new_sprint_id) {
            history.push('/projects/'+project_id+'/sprints/'+new_sprint_id);
        }
        dispatch(cloneTemplateSprint(sprint_id, onDone))
    }             

    render() {

        const { sprint_id, sprint, project } = this.props
        
        return (
            <div className="sidebar sprint-sidebar">
              <PropertyStack>

                <PropertyStackComponent>
                  <div className="property-text">
                    <button className="button button--large button--primary" onClick={this.cloneSprint}>
                      Clone now
                    </button>
                  </div>
                </PropertyStackComponent>
                { sprint.sprint_clone_ids &&
                  <PropertyStackComponent>
                    <div>
                      Clones of this template:
                      { map(sprint.sprint_clone_ids, (sprint_clone_id) => <SprintName sprint_id={sprint_clone_id} />)}
                    </div>
                  </PropertyStackComponent>
                }
                <PropertyStackComponent>
                  <div className="property--title">
                    <EditableSprintName sprint_id={sprint_id} />
                  </div>
                </PropertyStackComponent>
                <PropertyStackComponent>
                  <div className="property-text">{sprint.description}
                  </div>
                </PropertyStackComponent>

                <PropertyStackComponent>
                  <div className="property-text">
                    <EditableSprintStatus sprint_ids={[sprint.id]} project_id={sprint.project_id} />
                  </div>
                </PropertyStackComponent>

                <PropertyStackComponent>
                  <div className="property-text">
                    Type: <EditableSprintType sprint_ids={[sprint.id]} project_id={sprint.project_id} />
                  </div>
                </PropertyStackComponent>
                
                <PropertyStackComponent>
                  <div className="named-property">
                    <div className="named-property__name">Created</div>
                    <div className="named-property__value"><Timestamp format="short-date" value={moment(sprint.created)}/></div>
                  </div>
                </PropertyStackComponent>
              </PropertyStack>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id, project_id } = props
    const project = getProject(state, project_id)
    const sprint = getSprint(state, sprint_id) || {}
    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project
    }
}

export default withRouter(connect(mapStateToProps)(SprintTemplateSidebar))

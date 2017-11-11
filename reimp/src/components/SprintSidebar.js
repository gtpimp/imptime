import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import PropertyStack from '../components/PropertyStack'
import PropertyStackComponent from '../components/PropertyStackComponent'
import Timestamp from '../components/Timestamp'
import moment from 'moment'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import EditableSprintName from '../components/EditableSprintName'
import EditableSprintStatus from '../components/EditableSprintStatus'
import EditableSprintDeadline from '../components/EditableSprintDeadline'
import SprintName from './SprintName'

class SprintSidebar extends Component {

    constructor(props) {
        super(props)
        this.showEmacsSprint = this.showEmacsSprint.bind(this)
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

    showEmacsSprint() {
        const { issue, sprint } = this.props
        const text = "** sprint#" + sprint.id + " " + sprint.name
        window.prompt("Press Ctrl+C then Enter, then paste into emacs:", text);
    }

    render() {

        const { sprint_id, sprint, project } = this.props
        
        return (
            <div className="sidebar sprint-sidebar">
                <PropertyStack>

                    <PropertyStackComponent>
                        { sprint.sprint_template_id &&
                          <div className="property-text">
                            Cloned from <SprintName sprint_id={sprint.sprint_template_id} />
                          </div>
                        }
                        
                    </PropertyStackComponent>

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
                      <div onClick={this.showEmacsSprint}>
                        Sprint
                        <div className="sprint_sidebar__emacs_copy_img" />
                      </div>
                    </PropertyStackComponent>
                    
                    <PropertyStackComponent>
                        <div className="property-text">
                            Status: <EditableSprintStatus sprint_ids={[sprint.id]} project_id={sprint.project_id} />
                        </div>
                    </PropertyStackComponent>
                    
                    <PropertyStackComponent>
                        <div className="named-property">
                            <div className="named-property__name">Created</div>
                            <div className="named-property__value"><Timestamp format="short-date" value={moment(sprint.created)}/></div>
                        </div>
                    </PropertyStackComponent>
                    <PropertyStackComponent>
                        <div className="named-property">
                            <div className="named-property__name">First Activity</div>
                            <div className="named-property__value"><Timestamp format="short-date" value={sprint.first_entry && moment(sprint.first_entry.start_time)}/></div>
                        </div>
                    </PropertyStackComponent>
                    <PropertyStackComponent>
                        <div className="named-property">
                            <div className="named-property__name">Last Activity</div>
                            <div className="named-property__value"><Timestamp format="short-date" value={sprint.last_entry && moment(sprint.last_entry.end_time)}/></div>
                        </div>
                    </PropertyStackComponent>
                </PropertyStack>

                <PropertyStackComponent title="Deadlines">
                  { map(sprint.deadlines, function (deadline, index) {
                        return <EditableSprintDeadline key={sprint.id, deadline.id} sprint_id={sprint.id} deadline_id={deadline.id}/>
                    })
                  }
                  <EditableSprintDeadline deadline_id={sprint.id} deadline_id={null}/>
                </PropertyStackComponent>

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

export default connect(mapStateToProps)(SprintSidebar)


import React, {Component} from 'react'
import {connect} from 'react-redux'
import {ensureSprintsLoaded, getSprints} from '../actions/Sprints'
import PropertyStack from '../components/PropertyStack'
import PropertyStackComponent from '../components/PropertyStackComponent'
import { has_permission } from '../actions/Users'
import EditableSprintStatus from './EditableSprintStatus'
import MultipleIssueSummary from './MultipleIssueSummary'
import { doesMienHaveFeature } from '../actions/Mien'

class MultipleSprintSidebar extends Component {

    componentDidMount() {
        const {sprint_ids, dispatch} = this.props
        dispatch(ensureSprintsLoaded(sprint_ids))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch} = this.props
        dispatch(ensureSprintsLoaded(new_props.sprint_ids))
    }

    render() {

        const {sprints, sprint_ids, project_id, sprint, show_summary_section} = this.props

        return (

            <div className="sidebar sprint-sidebar">
              <PropertyStack>
                <PropertyStackComponent>
                  <div className="property-row">
                    <div className="property-value">
                      { sprints.length } sprints selected
                    </div>
                  </div>
                  
                  <div className="property-row">
                    <div className="property-label">
                      Sprint
                    </div>
                    <div className="property-value">
                      <EditableSprintStatus sprint_ids={sprint_ids}/>
                    </div>
                  </div>
                </PropertyStackComponent>

                { show_summary_section &&
                  <PropertyStackComponent>
                    <MultipleIssueSummary filter={{sprint_ids:sprint_ids}} project_id={project_id} />
                  </PropertyStackComponent>
                }
              </PropertyStack>
              
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {sprint_ids, project_id} = props
    const sprints = getSprints(state, sprint_ids) || []
    let sprint = null
    if ( sprints && sprints.length > 0 ) {
        sprint = sprints[0]
    }
    
    const show_summary_section = doesMienHaveFeature(state, 'multiple_issue_summary')
        
    return {
        sprints: sprints || [],
        sprint,
        sprint_ids,
        project_id,
        show_summary_section,
    }
}

export default connect(mapStateToProps)(MultipleSprintSidebar)

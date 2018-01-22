import React, {Component} from 'react'
import {connect} from 'react-redux'
import Sidebar from './Sidebar'
import {ensureSprintsLoaded, getSprints} from '../actions/Sprints'
import PropertyStackComponent from '../components/PropertyStackComponent'
import { has_permission } from '../actions/Users'
import EditableSprintStatus from './EditableSprintStatus'

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

        const {sprints, sprint_ids, sprint} = this.props

        return (

            <div className="sidebar sprint-sidebar">
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
    return {
        sprints: sprints || [],
        sprint,
        sprint_ids,
        project_id
    }
}

export default connect(mapStateToProps)(MultipleSprintSidebar)

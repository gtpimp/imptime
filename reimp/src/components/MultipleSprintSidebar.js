import React, {Component} from 'react'
import {connect} from 'react-redux'
import {ensureSprintsLoaded, getSprints} from '../actions/Sprints'
import MienFeature from './MienFeature'
import EditableSprintStatus from './EditableSprintStatus'
import EditableSprintType from '../components/EditableSprintType'
import MultipleIssueSummary from './MultipleIssueSummary'
import SidebarProperty from './SidebarProperty'
import SidebarDetail from './SidebarDetail'
import SidebarSectionTitle from './SidebarSectionTitle'

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

        const {sprints, sprint_ids, project_id} = this.props

        return (


            <SidebarProperty key="infostack">
              <SidebarDetail label="Last Activity">
                { sprints.length } sprints selected
              </SidebarDetail>
              
              <SidebarDetail label="Status">
                <EditableSprintStatus sprint_ids={sprint_ids} project_id={project_id} />
              </SidebarDetail>

              <SidebarDetail label="Type">
                <EditableSprintType sprint_ids={sprint_ids} project_id={project_id} />
              </SidebarDetail>

              <MienFeature feature_name="multiple_issue_summary">
                <SidebarSectionTitle title="Multiple Issue Summary" />
                <MultipleIssueSummary filter={{sprint_ids:sprint_ids}} project_id={project_id} auto_load={false} />
              </MienFeature>
                
            </SidebarProperty>
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

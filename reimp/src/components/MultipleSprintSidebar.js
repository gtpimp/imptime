import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {browserHistory} from 'react-router'
// import PropertyStack from './PropertyStack'
// import PropertyStackComponent from './PropertyStackComponent'
// import SprintDescription from './SprintDescription'
import Timestamp from './Timestamp'
import moment from 'moment'
import Sidebar from './Sidebar'
import {ensureSprintsLoaded, getSprints} from '../actions/Sprints'

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

            <Sidebar>

                <div>
                    { sprints.length } sprints selected
                </div>

            </Sidebar>
        )
    }
}

function mapStateToProps(state, props) {
    const {sprint_ids, project_id} = props
    const sprints = getSprints(state, sprint_ids) || {}
    return {
        sprints: sprints || [],
        sprint_ids: sprint_ids,
        project_id: project_id
    }
}

export default connect(mapStateToProps)(MultipleSprintSidebar)




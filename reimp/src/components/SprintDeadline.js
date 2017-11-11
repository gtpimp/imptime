import React, {Component} from 'react'
import {connect} from 'react-redux'
import Timestamp from '../components/Timestamp'
import { has_permission } from '../actions/Users'
import { getSprintDeadline,
         ensureSprintDeadlinesLoaded
} from '../actions/SprintDeadlines'
import {
    ensureSprintsLoaded,
    getSprint
} from '../actions/Sprints'
import moment from 'moment'

class SprintDeadline extends Component {

    componentDidMount() {
        const { dispatch, deadline_id, sprint_id } = this.props
        if ( deadline_id ) {
            dispatch(ensureSprintDeadlinesLoaded([deadline_id]))
            sprint_id && dispatch(ensureSprintsLoaded([sprint_id]))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { deadline_id, sprint_id } = new_props
        if ( deadline_id ) {
            dispatch(ensureSprintDeadlinesLoaded([deadline_id]))
            sprint_id && dispatch(ensureSprintsLoaded([sprint_id]))
        }
    }

    render() {

        const {deadline, can_view, can_edit, sprint_id} = this.props
        if ( ! can_view ) {
            return (<div></div>)
        }

        return (
            <div className="sprint-deadline">
              <div className="sprint-deadline--heading">
                <div className="sprint-deadline--type">
                  {deadline.deadline_type_name}
                </div>
                <div className="sprint-deadline--deadline">
                  <Timestamp value={deadline.deadline} format="date" />
                </div>
              </div>
              <div className="sprint-deadline--description">
                {deadline.description}
              </div>
              <div className="sprint-deadline--hard">
                { deadline.is_hard_deadline && "Hard deadline" }
                { !deadline.is_hard_deadline && "Soft deadline" }
              </div>
              <div className="sprint-deadline--classification">
                { deadline.represents_sprint_start && "Start of sprint" }
                { deadline.represents_sprint_end && "End of sprint" }
              </div>
            </div>
        )
    }    
    
}

function mapStateToProps(state, props) {

    const { deadline_id } = props
    const deadline = getSprintDeadline(state, deadline_id) || {}
    const sprint = (deadline.sprint_id && getSprint(state, deadline.sprint_id)) || {}
    const can_edit = (sprint.id && has_permission(state, sprint.project_id, 'has_edit_deadlines')) || false
    const can_view = (sprint.id && has_permission(state, sprint.project_id, 'has_view_deadlines')) || false
    
    return {
        deadline_id: deadline_id,
        sprint_id: sprint.id,
        deadline: deadline,
        deadline_modified: deadline.modified,
        can_edit: can_edit,
        can_view: can_view
    }
}

export default connect(mapStateToProps)(SprintDeadline)

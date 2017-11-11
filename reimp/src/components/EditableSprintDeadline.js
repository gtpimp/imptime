import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import EditableProperty from './form/EditableProperty'
import Timestamp from '../components/Timestamp'
import {
    updateSprintDeadline,
    createSprintDeadline,
    deleteSprintDeadline,
    ensureSprintsLoaded,
    getSprint,
    is_sprint_invalidated
} from '../actions/Sprints'
import SprintDeadlineForm from './form/SprintDeadlineForm'
import Label from './form/Label'
import Blank from './form/Blank'
import { has_permission } from '../actions/Users'
import TickCross from './TickCross'

class EditableSprintDeadline extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onDelete = this.onDelete.bind(this)
    }

    componentWillMount() {
        const { dispatch, sprint_id } = this.props
        dispatch(ensureSprintsLoaded([sprint_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { sprint_id } = new_props
        dispatch(ensureSprintsLoaded([sprint_id]))
    }

    onChange(new_values) {
        const { dispatch, sprint_id, deadline_id } = this.props
        if ( deadline_id ) {
            dispatch(updateSprintDeadline(sprint_id, deadline_id, new_values))
        } else {
            dispatch(createSprintDeadline(sprint_id, new_values))
        }
    }

    onDelete(new_value) {
        const { dispatch, sprint_id, deadline_id } = this.props
        dispatch(deleteSprintDeadline(sprint_id, deadline_id))
    }

    render() {

        const {deadline, can_view, can_edit, sprint_id} = this.props
        if ( ! can_view ) {
            return (<div>No permission to view deadlines</div>)
        }

        return (

            <div>
              { deadline.id &&
                <div>
                  <EditableProperty property_key={'sprint_deadline_'+sprint_id+'_'+deadline.id}
                                    initial_value={deadline.deadline}
                                    onChange={this.onChange}
                                    can_edit={can_edit}
                  >
                    <SprintDeadlineForm form={'sprint_deadline_form_'+sprint_id+'_'+deadline.id}
                                        sprint_id={sprint_id} deadline={deadline}/>
                    <div className="text-component--readonly text-component--deadline">
                      <div className="sprint_sidebar--deadline_date" >
                        {deadline.deadline_type_name}
                      </div>
                      <div className="sprint_sidebar--textarea--readonly" >
                        <Timestamp value={deadline.deadline} />
                      </div>
                    </div>
                    <div className="text-component">
                      {deadline.description}
                    </div>
                    <div className="text-component">
                      { deadline.is_hard_deadline && "Hard deadline" }
                      { !deadline.is_hard_deadline && "Soft deadline" }
                    </div>
                    <div className="text-component">
                      { deadline.represents_sprint_start && "Start of sprint" }
                      { deadline.represents_sprint_end && "End of sprint" }
                    </div>
                  </EditableProperty>
                  <button className="button button--danger sprint_sidebar--button" onClick={this.onDelete}>delete</button>
                </div>
              }

              { ! deadline.id &&
                <div>
                  <EditableProperty property_key={'sprint_deadline_'+sprint_id}
                                    initial_value=''
                                    onChange={this.onChange}
                                    can_edit={can_edit}
                    >
                    <SprintDeadlineForm form={'sprint_deadline_form_'+sprint_id} sprint_id={sprint_id} />
                    <div className="text-component--readonly"></div>
                    <div className="text-component--empty">
                      <button className="button button--primary sprint_sidebar--button">Create deadline</button>
                    </div>
                  </EditableProperty>
                </div>
              }

            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { sprint_id, deadline_id } = props
    const sprint = getSprint(state, sprint_id) || {}

    const can_edit = has_permission(state, sprint.project_id, 'has_edit_deadlines')
    const can_view = has_permission(state, sprint.project_id, 'has_view_deadlines')

    let deadline = { id: null}
    map(sprint.deadlines || [], function(sprint_deadline, index) {
        if ( sprint_deadline.id === deadline_id ) {
            deadline = sprint_deadline
        }
    })

    return {
        sprint_id: sprint_id,
        deadline_id: deadline_id,
        deadline: deadline,
        can_edit: can_edit,
        can_view: can_view,
        is_invalidated: is_sprint_invalidated(state, sprint.id),
    }
}

export default connect(mapStateToProps)(EditableSprintDeadline)

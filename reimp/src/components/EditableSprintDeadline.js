import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import {
    getSprint,
} from '../actions/Sprints'
import { updateSprintDeadline,
         createSprintDeadline,
         deleteSprintDeadline,
         getSprintDeadline,
         ensureSprintDeadlinesLoaded
} from '../actions/SprintDeadlines'

import SprintDeadlineForm from './form/SprintDeadlineForm'
import { has_permission } from '../actions/Users'
import SprintDeadline from './SprintDeadline'
import moment from 'moment'
import SidebarPrimaryButton from './SidebarPrimaryButton'
import SidebarDangerButton from './SidebarDangerButton'

const button_block = css`
padding: 12px 0 12px 0;
`

class EditableSprintDeadline extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onDelete = this.onDelete.bind(this)
    }

    componentDidMount() {
        const { dispatch, deadline_id } = this.props
        if ( deadline_id ) {
            dispatch(ensureSprintDeadlinesLoaded([deadline_id]))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { deadline_id } = new_props
        if ( deadline_id ) {
            dispatch(ensureSprintDeadlinesLoaded([deadline_id]))
        }
    }

    onChange(new_values) {
        const { dispatch, deadline_id, sprint_id } = this.props

        new_values['deadline_type'] = new_values['deadline_type'] && new_values['deadline_type']['id']
        new_values['deadline'] = new_values['deadline'] || moment()
        
        if ( deadline_id ) {
            dispatch(updateSprintDeadline([deadline_id], new_values))
        } else {
            new_values.sprint_id = sprint_id
            dispatch(createSprintDeadline(new_values))
        }
    }

    onDelete(event) {
        const { dispatch, deadline_id } = this.props
        event.stopPropagation()
        if ( ! window.confirm("Delete this deadline?") ) {
            return
        }
        dispatch(deleteSprintDeadline(deadline_id))
    }

    render() {

        const {deadline, can_view, can_edit, sprint_id, project_id} = this.props
        if ( ! can_view ) {
            return (<div>No permission to view deadlines</div>)
        }

        return (

            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_deadlines'>
              <PermissionInspectorHighlighter project_id={project_id}
                                              permission_name='has_view_deadlines'>
                { deadline.id &&
                  <div>
                    <EditableProperty property_key={'sprint_deadline_'+sprint_id+'_'+deadline.id}
                                      initial_value={deadline.deadline}
                                      onChange={this.onChange}
                                      actionLabel="Sprint deadline"
                                      edit_as_modal={true}
                                      can_edit={can_edit}
                      >
                      <SprintDeadlineForm form={'sprint_deadline_form_'+sprint_id+'_'+deadline.id}
                                          sprint_id={sprint_id}
                                          deadline={deadline}/>
                      <div className="sprint-deadline__card">
                        <SprintDeadline deadline_id={deadline.id} />
                        <div className={ button_block }>
                          <SidebarDangerButton onButtonClick={this.onDelete} label="Delete" />
                        </div>
                      </div>
                    </EditableProperty>
                  </div>
                }

                { ! deadline.id && can_edit &&
                  <div>
                    <EditableProperty property_key={'sprint_deadline_'+sprint_id}
                                      initial_value=''
                                      onChange={this.onChange}
                                      actionLabel="Sprint deadline"
                                      edit_as_modal={true}
                                      can_edit={can_edit}
                      >
                      <SprintDeadlineForm form={'sprint_deadline_form_'+sprint_id}
                                          sprint_id={sprint_id} />
                      <div className="text-component--readonly"></div>
                      <div className={ button_block }>
                        <SidebarPrimaryButton label="Create Deadline" />
                      </div>
                    </EditableProperty>
                  </div>
                }

              </PermissionInspectorHighlighter>
            </PermissionInspectorHighlighter>
        )
    }
}

function mapStateToProps(state, props) {

    const { sprint_id, deadline_id } = props
    const sprint = getSprint(state, sprint_id) || {}

    const can_edit = has_permission(state, sprint.project_id, 'has_edit_deadlines')
    const can_view = has_permission(state, sprint.project_id, 'has_view_deadlines')
    const deadline = getSprintDeadline(state, deadline_id) || {}
    
    return {
        sprint_id: sprint_id,
        project_id: sprint.project_id,
        deadline_id: deadline_id,
        deadline: deadline,
        deadline_modified: deadline.modified,
        can_edit: can_edit,
        can_view: can_view
    }
}

export default connect(mapStateToProps)(EditableSprintDeadline)

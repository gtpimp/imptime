import React, {Component} from 'react'
import {connect} from 'react-redux'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import EditableProperty from './form/EditableProperty'
import SprintCommissionForm from './form/SprintCommissionForm'
import { ensureSprintsLoaded, updateSprintCommission, getSprint, is_sprint_invalidated } from '../actions/Sprints'
import { has_permission } from '../actions/Users'

class EditableSprintCommission extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, sprint } = this.props
        dispatch(updateSprintCommission([sprint.id], new_value.commission_percentage))
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, sprint_id } = props
        dispatch(ensureSprintsLoaded([sprint_id]))
    }

    render() {
        const { sprint, can_edit, can_view } = this.props

        return (
            <PermissionInspectorHighlighter project_id={sprint.project_id}
                                            permission_name='has_edit_ctc_billable_rates'>
              <PermissionInspectorHighlighter project_id={sprint.project_id}
                                              permission_name='has_view_ctc_billable_rates'>
                <EditableProperty property_key={'sprint_commission_'+sprint.id}
                                  initial_value={sprint.commission_percentage}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                                  edit_as_modal={true}
                                  actionLabel="Edit Sprint Commission"
                >
                  <SprintCommissionForm sprint_id={sprint.id} />
                  <div className="text-component--readonly">
                    { can_view && <div>Commission: {sprint.commission_percentage}%</div> }
                  </div>
                  <div className="text-component--empty"></div>
                </EditableProperty>
              </PermissionInspectorHighlighter>
            </PermissionInspectorHighlighter>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id } = props
    const sprint = getSprint(state, sprint_id) || {}
    const is_invalidated = is_sprint_invalidated(state, sprint_id)
    const can_edit = has_permission(state, sprint.project_id, 'has_edit_ctc_billable_rates')
    const can_view = has_permission(state, sprint.project_id, 'has_view_ctc_billable_rates')

    return {
        sprint: sprint,
        is_invalidated,
        can_edit,
        can_view
    }
}


export default connect(mapStateToProps)(EditableSprintCommission)

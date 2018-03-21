import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import SprintRatiosForm from './form/SprintRatiosForm'
import SprintRatios from './SprintRatios'
import { ensureSprintsLoaded, updateSprintRatios, getSprint, is_sprint_invalidated } from '../actions/Sprints'
import { has_permission } from '../actions/Users'

class EditableSprintRatios extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_values) {
        const { dispatch, sprint } = this.props
        dispatch(updateSprintRatios([sprint.id], new_values))
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
            <EditableProperty property_key={'sprint_ratios_'+sprint.id}
                              initial_value={{ratio_management: sprint.ratio_management,
                                              ratio_testing: sprint.ratio_testing,
                                              ratio_scope_creep: sprint.ratio_scope_creep}}
                              onChange={this.onChange}
                              can_edit={can_edit}
                              edit_as_modal={true}
                              actionLabel="Edit Sprint Ratios"
            >
              <SprintRatiosForm sprint_id={sprint.id} />
              <SprintRatios sprint_id={sprint.id} />
              <div className="text-component--empty"></div>
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id } = props
    const sprint = getSprint(state, sprint_id) || {}
    const is_invalidated = is_sprint_invalidated(state, sprint_id)
    const can_edit = has_permission(state, sprint.project_id, 'has_edit_velocity')
    const can_view = has_permission(state, sprint.project_id, 'has_view_velocity')

    return {
        sprint: sprint,
        is_invalidated,
        can_edit,
        can_view
    }
}


export default connect(mapStateToProps)(EditableSprintRatios)

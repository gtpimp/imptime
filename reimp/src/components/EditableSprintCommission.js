import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import SprintCommissionForm from './form/SprintCommissionForm'
import { ensureSprintsLoaded, updateSprintCommission, getSprint, is_sprint_invalidated } from '../actions/Sprints'

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
        const { sprint } = this.props

        return (
            <EditableProperty property_key={'sprint_name'+sprint.id}
                              initial_value={sprint.commission_percentage}
                              onChange={this.onChange}
                              can_edit={true}
                              edit_as_modal={true}
                              actionLabel="Edit Sprint Commission"
            >
              <SprintCommissionForm sprint_id={sprint.id} />
              <div className="text-component--readonly">Commission: {sprint.commission_percentage}%</div>
              <div className="text-component--empty">None</div>
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id } = props
    const sprint = getSprint(state, sprint_id) || {}
    const is_invalidated = is_sprint_invalidated(state, sprint_id)

    return {
        sprint: sprint,
        is_invalidated
    }
}


export default connect(mapStateToProps)(EditableSprintCommission)

import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import SprintBudgetForm from './form/SprintBudgetForm'
import { ensureSprintsLoaded, updateSprintBudget, getSprint, is_sprint_invalidated } from '../actions/Sprints'
import { has_permission } from '../actions/Users'
import CurrencyValue from './CurrencyValue'

class EditableSprintBudget extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, sprint } = this.props
        dispatch(updateSprintBudget([sprint.id], new_value.budget))
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
            <EditableProperty property_key={'sprint_budget_'+sprint.id}
                              initial_value={sprint.budget}
                              onChange={this.onChange}
                              can_edit={can_edit}
                              edit_as_modal={true}
                              actionLabel="Edit Sprint Budget"
            >
              <SprintBudgetForm sprint_id={sprint.id} />
              <div className="text-component--readonly">
                { can_view &&
                  <div>Budget: <CurrencyValue value={sprint.budget}/></div>
                }
              </div>
              <div className="text-component--empty"></div>
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id } = props
    const sprint = getSprint(state, sprint_id) || {}
    const is_invalidated = is_sprint_invalidated(state, sprint_id)
    const can_edit = has_permission(state, sprint.project_id, 'has_edit_budget')
    const can_view = has_permission(state, sprint.project_id, 'has_view_budget')

    return {
        sprint: sprint,
        is_invalidated,
        can_edit,
        can_view
    }
}


export default connect(mapStateToProps)(EditableSprintBudget)

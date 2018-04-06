import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import { getSprint } from '../../actions/Sprints'
import SprintName from '../../components/SprintName'
import { has_permission } from '../../actions/Users'

class SprintRatiosForm extends Component {

    constructor(props) {
        super(props)
        this.renderRatioManagementField = this.renderRatioManagementField.bind(this)
        this.renderRatioTestingField = this.renderRatioTestingField.bind(this)
        this.renderRatioScopeCreepField = this.renderRatioScopeCreepField.bind(this)
    }

    componentDidMount() {
        this.input_testing_el && this.input_testing_el.focus()
    }
    
    renderRatioManagementField(field) {
        const {input} = field
        return (
            <input
                maxLength="10"
                placeholder="Management"
                value={input.value}
                onChange={input.onChange}
                ref={(ref)=> this.input_management_el=ref}
            />
        )
    }

    renderRatioTestingField(field) {
        const {input} = field
        return (
            <input
                maxLength="10"
                placeholder="Testing"
                value={input.value}
                onChange={input.onChange}
                ref={(ref)=> this.input_testing_el=ref}
            />
        )
    }

    renderRatioScopeCreepField(field) {
        const {input} = field
        return (
            <input
                maxLength="10"
                placeholder="Scope creep"
                value={input.value}
                onChange={input.onChange}
                ref={(ref)=> this.input_scope_creep_el=ref}
            />
        )
    }

    render() {
        const { handleSubmit, sprint, can_edit } = this.props

        if ( ! can_edit ) {
            return "Insufficient permissions"
        }
        
        return (
            <div className="popup-form">
              { (!sprint || !sprint.id) && <div>Loading...</div> }
              <div className="popup-form__title">
                <div className="popup-form__title__fluff">
                  Ratios for 
                </div>
                <div className="popup-form__title__value">
                  <SprintName sprint_id={sprint.id}/>
                </div>
              </div>
              <br/>
              <form onSubmit={handleSubmit}>
                <div className="popup-form__field">
                  <div className="popup-form__title__value">
                    Testing ratio
                  </div>
                  <div>
                    <Field name="ratio_testing" component={this.renderRatioTestingField}/>
                  </div>
                  <div className="popup-form__title__fluff">
                    A number from 0 to 1, based on the development time.
                    <br/>
                    1 means every hour of development requires an hour of testing.
                    <br/>
                    0 means there is no testing.
                  </div>
                </div>                
                <div className="popup-form__field">
                  <div className="popup-form__title__value">
                    Management ratio
                  </div>
                  <div>
                    <Field name="ratio_management" component={this.renderRatioManagementField}/>
                  </div>
                  <div className="popup-form__title__fluff">
                    A number from 0 to 1, based on the development time.
                    <br/>
                    1 means every hour of development requires an hour of management.
                    <br/>
                    0 means there is no management.
                  </div>
                </div>
                <div className="popup-form__field">
                  <div className="popup-form__title__value">
                    Scope creep ratio
                  </div>
                  <div>
                    <Field name="ratio_scope_creep" component={this.renderRatioScopeCreepField}/>
                  </div>
                  <div className="popup-form__title__fluff">
                    A number larger or equal to 1, based on the total budget.
                    <br/>
                    1 means no scope creep.
                    <br/>
                    1.5 means add 50% to the budget
                    <br/>
                    2 means double the sprint budget
                  </div>
                </div>
                <br/>
                <button type="submit" className="popup-form__submit button button-primary">Save</button>
              </form>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, sprint_id } = props

    const sprint = getSprint(state, sprint_id)
    const can_edit = has_permission(state, sprint.project_id, 'has_edit_ctc_billable_rates')
    
    return {
        initialValues: { ratio_management: sprint.ratio_management,
                         ratio_testing: sprint.ratio_testing,
                         ratio_scope_creep: sprint.ratio_scope_creep },
        enableReinitialize: true,
        onSubmit: onSubmitted,
        sprint,
        can_edit
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_ratios_form'})(SprintRatiosForm))

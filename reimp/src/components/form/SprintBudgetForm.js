import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import { getSprint } from '../../actions/Sprints'
import SprintName from '../../components/SprintName'
import { has_permission } from '../../actions/Users'

class SprintBudgetForm extends Component {

    constructor(props) {
        super(props)
        this.renderField = this.renderField.bind(this)
    }

    componentDidMount() {
        this.input_el && this.input_el.focus()
    }
    
    renderField(field) {
        const {input} = field
        return (
            <input
                maxLength="10"
                placeholder="Budget"
                onChange={input.onChange}
                value={input.value}
                ref={(ref)=> this.input_el=ref}
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
                  Edit budget for sprint
                </div>
                <div className="popup-form__title__value">
                  <SprintName sprint_id={sprint.id}/>
                </div>
              </div>
              <br/>
              <form onSubmit={handleSubmit}>
                <div>
                  R<Field name="budget" component={this.renderField}/>
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
    const can_edit = has_permission(state, sprint.project_id, 'has_edit_budget')
    
    return {
        initialValues: {budget:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        sprint,
        can_edit
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_budget_form'})(SprintBudgetForm))

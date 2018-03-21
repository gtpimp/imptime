import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import { getSprint } from '../../actions/Sprints'
import SprintName from '../../components/SprintName'

class SprintCommissionForm extends Component {

    constructor(props) {
        super(props)
        this.renderField = this.renderField.bind(this)
    }

    componentDidMount() {
        this.input_el && this.input_el.focus()
    }
    
    renderField(field) {
        const {input, data, ...rest} = field
        return (
            <input
                maxLength="10"
                placeholder="Commission percentage"
                onChange={input.onChange}
                value={input.value}
                ref={(ref)=> this.input_el=ref}
            />
        )
    }

    render() {
        const { handleSubmit, sprint } = this.props
        return (

            
            <div className="popup-form">
              { (!sprint || !sprint.id) && <div>Loading...</div> }
              
              <div className="popup-form__title">
                <div className="popup-form__title__fluff">
                  Edit commission percentage for sprint
                </div>
                <div className="popup-form__title__value">
                  <SprintName sprint_id={sprint.id}/>
                </div>
              </div>
              <br/>
              <form onSubmit={handleSubmit}>
                <div>
                  <Field name="commission_percentage" component={this.renderField}/>
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
    
    return {
        initialValues: {commission_percentage:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        sprint
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_commission_form'})(SprintCommissionForm))

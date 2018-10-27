import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field, formValueSelector } from 'redux-form';
import TextAreaField from './TextAreaField'
import '../../sass/text-component.scss'

class CompanyNameForm extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
    }
    
    renderTextarea(field) {
        const {input} = field
        return (
            <TextAreaField
                rows={10}
                maxLength="300"
                className="textarea textarea--text-component textarea--title"
                placeholder="Name"
                onChange={input.onChange}
                value={input.value}
                autoFocus
            />
        )
    }

    render() {
        const { handleSubmit, onCancel } = this.props
        
        return (
            
            <form onSubmit={handleSubmit}>
              <div className="company_sidebar--form">
                <div className="company_sidebar--textarea">
                  <Field name="name"
                         component={this.renderTextarea} />
                </div>
                  <div className="company_sidebar__button_row">
                    <button className="button company_sidebar--textarea" type="submit">Submit</button>
                    <button className="button company_sidebar--textarea" type="button" onClick={() => onCancel()}>Cancel</button>
                  </div>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onCancel } = props
    const selector = formValueSelector('company_name_form')
    
    return {
        initialValues: {decision:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onCancel: onCancel,
        textAreaValue: selector(state, 'name')
    }
}

export default connect(mapStateToProps)(reduxForm({form:'company_name_form'})(CompanyNameForm))

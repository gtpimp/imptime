import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field, formValueSelector } from 'redux-form';
import TextAreaField from './TextAreaField'
import '../../sass/text-component.scss'

class DecisionJournalDescriptionForm extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
    }
    
    renderTextarea(field) {
        const {input} = field
        return (
            <TextAreaField
                rows="1"
                maxLength="300"
                classDescription="textarea textarea--text-component textarea--title"
                placeholder="Description"
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
              <div classDescription="decision_journal_sidebar--form">
                <div classDescription="decision_journal_sidebar--textarea">
                  <Field description="description"
                         component={this.renderTextarea} />
                </div>
                  <div classDescription="decision_journal_sidebar__button_row">
                    <button classDescription="button decision_journal_sidebar--textarea" type="submit">Submit</button>
                    <button classDescription="button decision_journal_sidebar--textarea" type="button" onClick={() => onCancel()}>Cancel</button>
                  </div>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onCancel } = props

    const selector = formValueSelector('decision_journal_description_form')
    
    return {
        initialValues: {description:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onCancel: onCancel,
        textAreaValue: selector(state, 'description')
    }
}

export default connect(mapStateToProps)(reduxForm({form:'decision_journal_description_form'})(DecisionJournalDescriptionForm))

import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field, formValueSelector } from 'redux-form';
import TextAreaField from './TextAreaField'
import '../../sass/text-component.scss'

class DecisionJournalRepercussionsForm extends Component {

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
                placeholder="Repercussions"
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
              <div className="decision_journal_sidebar--form">
                <div className="decision_journal_sidebar--textarea">
                  <Field name="repercussions"
                         component={this.renderTextarea} />
                </div>
                  <div className="decision_journal_sidebar__button_row">
                    <button className="button decision_journal_sidebar--textarea" type="submit">Submit</button>
                    <button className="button decision_journal_sidebar--textarea" type="button" onClick={() => onCancel()}>Cancel</button>
                  </div>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onCancel } = props
    const selector = formValueSelector('decision_journal_decision_form')
    
    return {
        initialValues: {repercussions:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onCancel: onCancel,
        textAreaValue: selector(state, 'repercussions')
    }
}

export default connect(mapStateToProps)(reduxForm({form:'decision_journal_decision_form'})(DecisionJournalRepercussionsForm))

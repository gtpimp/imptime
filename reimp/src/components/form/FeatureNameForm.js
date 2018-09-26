import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field, formValueSelector } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import '../../sass/text-component.scss'

class FeatureNameForm extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
    }
    
    renderTextarea(field) {
        const {input} = field
        return (
            <Textarea
                rows="1"
                maxLength="300"
                className="textarea textarea--text-component textarea--title"
                placeholder="Feature Name"
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
              <div className="feature_sidebar--form">
                <div className="feature_sidebar--textarea">
                  <Field name="name"
                         component={this.renderTextarea} />
                </div>
                  <div className="feature_sidebar__button_row">
                    <button className="button feature_sidebar--textarea" type="submit">Submit</button>
                    <button className="button feature_sidebar--textarea" type="button" onClick={() => onCancel()}>Cancel</button>
                  </div>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onCancel } = props

    const selector = formValueSelector('feature_name_form')
    
    return {
        initialValues: {name:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onCancel: onCancel,
        textAreaValue: selector(state, 'name')
    }
}

export default connect(mapStateToProps)(reduxForm({form:'feature_name_form'})(FeatureNameForm))

import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from '../PropertyStack'
import PropertyStackComponent from '../PropertyStackComponent'
import { Field, reduxForm } from 'redux-form'
import Textarea from 'react-expanding-textarea'

class AutoClockQuickEntryForm extends Component {

    constructor(props) {
        super(props)
        this.renderDescriptionField = this.renderDescriptionField.bind(this)
    }

    renderDescriptionField(field) {
        const {input} = field
        return (
            <Textarea
                rows="10"
                className="textarea textarea--text-component textarea--description"
                placeholder="Description"
                onChange={input.onChange}
                value={input.value}
            />
        )
    }

    render() {
        const { handleSubmit  } = this.props

        return (
            <form className="auto-clock-form" onSubmit={handleSubmit}>
              <PropertyStack>
                <PropertyStackComponent>
                  <div className="property-row">
                    <div className="property-value">
                      <Field name="description" component={this.renderDescriptionField} />
                    </div>
                  </div>
                  <button type="submit">Start</button>
                </PropertyStackComponent>
              </PropertyStack>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted } = props

    return {
        initialValues: {},
        enableReinitialize: true,
        onSubmit: onSubmitted
    }
}

export default connect(mapStateToProps)(reduxForm({form:'auto_clock_quick_entry_form'})(AutoClockQuickEntryForm))

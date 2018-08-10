import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import classNames from 'classnames'
import PropertyStack from '../PropertyStack'
import PropertyStackComponent from '../PropertyStackComponent'
import { map } from 'lodash'
import { Field, reduxForm } from 'redux-form'
import Textarea from 'react-expanding-textarea'
import { default_theme as theme } from '../../theme/default'

class AutoClockManagementEntryForm extends Component {

    constructor(props) {
        super(props)
        this.renderActionFields = this.renderActionFields.bind(this)
        this.renderDescriptionField = this.renderDescriptionField.bind(this)
    }

    renderActionFields(field) {
        const { action_options } = this.props
        const {input} = field
        return (
            <div className={css`display:flex;flex-flow: row wrap;`}>
              {
                  map(action_options, function(option) {
                      const checked = input.value && input.value === option.value
                      return (
                          <div key={option.value}
                               className={css`margin-left:${theme.spacing.horizontal_space_inline};
                                              margin-left:${theme.spacing.horizontal_space_inline}`}>
                            <label key={option.value}
                                   className={classNames("auto-clock__radio",
                                                         {"auto-clock__radio--checked":checked,
                                                          "auto-clock__radio--unchecked":!checked})}>
                              <input type="radio"
                                     name="action"
                                     value={option.value}
                                     onChange={input.onChange}
                                     checked={checked} />
                              {option.label}
                            </label>
                          </div>
                      )
                  })
              }
            </div>
        )
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
        const { handleSubmit } = this.props

        return (
            <form className="auto-clock-form" onSubmit={handleSubmit}>
              <PropertyStack>
                <PropertyStackComponent>
                  
                  <div className="property-row">
                    <div className="property-value">
                      <Field name="action" component={this.renderActionFields} />
                    </div>
                  </div>
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
    const action_options = [ {value: 'management-general', label: 'General'},
                             {value: 'management-meeting', label: 'Meeting'},
                             {value: 'management-spec', label: 'Spec'},
                             {value: 'management-finance', label: 'Finance'},
                             {value: 'management-assign', label: 'Assign'},
                             {value: 'management-estimate', label: 'Estimate'},
                             {value: 'management-testables', label: 'Testables'},
                             {value: 'adhoc', label: 'Adhoc'}
    ]

    return {
        initialValues: {},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        can_clock_admin: true,
        action_options
    }
}

export default connect(mapStateToProps)(reduxForm({form:'auto_clock_management_entry_form'})(AutoClockManagementEntryForm))

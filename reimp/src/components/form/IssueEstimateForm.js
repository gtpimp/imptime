import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import { reduxForm, Field } from 'redux-form';
import '../../sass/text-component.scss'

const DEFAULT_TIME_ESTIMATES = [ "0:00", "0:15", "0:30", "0:45",
                                 "1:00", "1:15", "1:30", "1:45",
                                 "2:00", "2:30",
                                 "3:00", "3:30",
                                 "4:00",
                                 "8:00", "12:00", "16:00"]

class IssueEstimateForm extends Component {

    constructor(props) {
        super(props)
        this.renderInput = this.renderInput.bind(this)
        this.keyDown = this.keyDown.bind(this)
        this.quickSelectDefaultEstimate = this.quickSelectDefaultEstimate.bind(this)
    }

    componentDidMount() {
        this.input_el && this.input_el.focus()
        this.input_el && this.input_el.setSelectionRange(0, this.input_el.value.length);
    }

    keyDown(event) {
        const { onKeyDown } = this.props
        if (onKeyDown) {
            onKeyDown(event)
        }
    }
    
    quickSelectDefaultEstimate(time_estimate) {
        const { onSubmitted } = this.props
        onSubmitted({estimate:time_estimate})
    }

    renderInput(field) {
        const {input} = field
        return (
            <input
                rows="1"
                maxLength="10"
                className="textarea--estimate"
                placeholder="estimate"
                onChange={input.onChange}
                value={input.value}
                ref={(ref)=> this.input_el=ref}
                onKeyDown={this.keyDown}
            />
        )
    }

    render() {
        const { handleSubmit } = this.props
        const that = this

        return (
            <form onSubmit={handleSubmit}>
              <div>
                <div className="issue_sidebar--textarea">
                  <Field name="estimate" component={this.renderInput} />
                </div>
                <div className="issue-estimate-form__default_estimates">
                  { map(DEFAULT_TIME_ESTIMATES, function(time_estimate) {
                        return (
                            <div key={time_estimate} className="issue-estimate-form__default_estimate"
                                 onClick={() => that.quickSelectDefaultEstimate(time_estimate)}
                                >
                              {time_estimate}
                            </div>
                        )
                    })
                  }
                </div>
                <button className="button issue_sidebar--textarea" type="submit">Submit</button>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted } = props

    return {
        initialValues: {estimate:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_estimate_form'})(IssueEstimateForm))


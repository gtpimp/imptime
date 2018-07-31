import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import SingleValueSelector from './SingleValueSelector'

class IssueRiskyForm extends Component {

    constructor(props) {
        super(props)
        this.renderSingleValueSelector = this.renderSingleValueSelector.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh()
    }

    refresh() {
        
    }

    onChangeAndSubmit(e, fieldOnChange) {
        const {handleSubmit} = this.props
        fieldOnChange(e)
        setTimeout(() => handleSubmit(), 0)
    }

    renderSingleValueSelector(field) {
        const {input, data, ...rest} = field
        return (
            <SingleValueSelector
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                options={data}
                {...rest}
            />
        )
    }

    render() {
        const { handleSubmit, risky_options } = this.props
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="issue_risky">Risky</label>
                    <Field name="issue_risky"
                           component={this.renderSingleValueSelector}
                           valueField="value"
                           textField="label"
                           data={risky_options}
                    />
                </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted } = props
    const risky_options = [ {value: 0, label: "Not risky"},
                            {value: 1, label: "Risky"} ]

    return {
        initialValues: {},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        risky_options: risky_options
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_risky_form'})(IssueRiskyForm))

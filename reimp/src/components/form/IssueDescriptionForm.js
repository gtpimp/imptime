import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import Textarea from 'react-expanding-textarea'

class IssueDescriptionForm extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
    }

    onChangeAndSubmit(e, fieldOnChange) {
        const {handleSubmit} = this.props
        fieldOnChange(e)
        // setTimeout(() => handleSubmit(), 0)
    }
    
    renderTextarea(field) {
        const {input, data, ...rest} = field
        return (
            <Textarea
                rows="1"
                maxLength="3000"
                className="textarea textarea--text-component"
                placeholder="Description"
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
            />
        )
    }
    
    render() {

        const { handleSubmit } = this.props

        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <Field name="description"
                           component={this.renderTextarea} />
                </div>
                <button type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onChange } = props
    
    return {
        initialValues: {description:props.initial_value},
        enableReinitialize: true,
        onSubmit: onChange
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_description_form'})(IssueDescriptionForm))


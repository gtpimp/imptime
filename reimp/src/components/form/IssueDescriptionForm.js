import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import Textarea from 'react-expanding-textarea'

class IssueDescriptionForm extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
        this.keyDown = this.keyDown.bind(this)
    }

    onChangeAndSubmit(e, fieldOnChange) {
        fieldOnChange(e)
    }

    componentDidMount() {
        this.description_el.refs.textarea && this.description_el.refs.textarea.focus()
    }

    keyDown(event) {
        const { onKeyDown } = this.props
        if (onKeyDown) {
            onKeyDown(event)
        }
    }

    renderTextarea(field) {
        const {input} = field
        return (
            <Textarea
                rows="1"
                className="textarea textarea--text-component textarea--description"
                placeholder="Description"
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                ref={(ref)=> this.description_el=ref}
                value={input.value}
                onKeyDown={this.keyDown}
            />
        )
    }

    render() {

        const { handleSubmit } = this.props

        return (
            <form onSubmit={handleSubmit}>
              <div>
                <div className="issue_sidebar--textarea">
                  <Field name="description"
                         component={this.renderTextarea} />
                </div>
              </div>
              <button className="button issue_sidebar--textarea" type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted } = props

    return {
        initialValues: {description:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_description_form'})(IssueDescriptionForm))

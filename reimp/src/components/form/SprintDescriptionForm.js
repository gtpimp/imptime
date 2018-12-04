import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import TextAreaField from './TextAreaField'

class SprintDescriptionForm extends Component {

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
            <TextAreaField
                rows={10}
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

        const { handleSubmit, onCancel } = this.props

        return (
            <form onSubmit={handleSubmit}>
              <div>
                <div className="sprint_sidebar--textarea">
                  <Field name="description"
                         component={this.renderTextarea} />
                </div>
              </div>
              <div className="sprint_sidebar__button_row">
                <button className="button sprint_sidebar--textarea" type="submit">Submit</button>
                <button className="button sprint_sidebar--textarea" onClick={onCancel}>Cancel</button>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onCancel } = props

    return {
        initialValues: {description:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onCancel
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_description_form'})(SprintDescriptionForm))

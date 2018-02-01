import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import Textarea from 'react-expanding-textarea'

class WikiForm extends Component {

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
        this.content_el.refs.textarea && this.content_el.refs.textarea.focus()
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
                rows="50"
                maxLength="3000"
                className="textarea textarea--text-component textarea--content"
                placeholder="Content"
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                ref={(ref)=> this.content_el=ref}
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
                <div className="project_sidebar--textarea">
                  <Field name="content"
                         component={this.renderTextarea} />
                </div>
              </div>
              <button className="button project_sidebar--textarea" type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted } = props

    return {
        initialValues: {content:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted
    }
}

export default connect(mapStateToProps)(reduxForm({form:'wiki_form'})(WikiForm))

import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import '../../sass/text-component.scss'

class NewIssueForm extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
        this.keyDown = this.keyDown.bind(this)
    }

    componentDidMount() {
        this.title_el && this.title_el.focus()
    }


    keyDown(event) {
        const { onKeyDown } = this.props
        if (onKeyDown) {
            onKeyDown(event)
        }
    }

    renderTextarea(field) {
        const {input, data, onChange, ...rest} = field
        return (
            <input
                maxLength="3000"
                className="textarea textarea--text-component textarea--title"
                placeholder="Title"
                onChange={input.onChange}
                value={input.value}
                ref={(ref)=> this.title_el=ref}
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
                  <Field name="title"
                         component={this.renderTextarea} />
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
        initialValues: {title:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted
    }
}

export default connect(mapStateToProps)(reduxForm({form:'new_issue_form'})(NewIssueForm))

import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import { getSprint } from '../../actions/Sprints'

class SprintDeadlineForm extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
        this.keyDown = this.keyDown.bind(this)
    }

    onChangeAndSubmit(e, fieldOnChange) {
        fieldOnChange(e)
        // setTimeout(() => handleSubmit(), 0)
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
                maxLength="3000"
                className="textarea textarea--text-component textarea--description"
                placeholder="Description"
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                onKeyDown={this.keyDown}
            />
        )
    }

    render() {

        const { deadline, handleSubmit } = this.props

        return (
            <div>
              <form onSubmit={handleSubmit}>
                <div>
                  <div className="sprint_sidebar--textarea">
                    <Field name="description"
                           component={this.renderTextarea} />
                  </div>
                </div>
                <button className="button sprint_sidebar--textarea" type="submit">Submit</button>
              </form>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { onSubmitted, sprint_id, deadline } = props
    const { sprint } = state;

    return {
        deadline: deadline,
        initialValues: {deadline:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_deadline_form'})(SprintDeadlineForm))

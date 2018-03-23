import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import Textarea from 'react-expanding-textarea'
import WikiNameField from './WikiNameField'

class WikiNameForm extends Component {

    constructor(props) {
        super(props)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
        this.keyDown = this.keyDown.bind(this)
    }

    onChangeAndSubmit(e, fieldOnChange) {
        fieldOnChange(e)
    }

    keyDown(event) {
        const { onKeyDown } = this.props
        if (onKeyDown) {
            onKeyDown(event)
        }
    }

    render() {

        const { handleSubmit, onKeyDown } = this.props

        return (
            <form onSubmit={handleSubmit}>
              <div>

                <h2>Wiki name</h2>
                <div className="project_sidebar--textarea">
                  <WikiNameField onKeyDown={onKeyDown} />
                </div>
              </div>
              <button className="button project_sidebar--textarea" type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onKeyDown } = props

    return {
        initialValues: {name:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onKeyDown
    }
}

export default connect(mapStateToProps)(reduxForm({form:'wiki_name_form'})(WikiNameForm))

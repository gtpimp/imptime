import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import '../../sass/text-component.scss'

class SprintNameForm extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
        /* this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)*/
    }

    /* onChangeAndSubmit(e, fieldOnChange) {
     *     const {handleSubmit} = this.props
     *     fieldOnChange(e)
     *     // setTimeout(() => handleSubmit(), 0)
     * }*/

    renderTextarea(field) {
        const {input, data, ...rest} = field
        return (
            <Textarea
                rows="1"
                maxLength="3000"
                className="textarea textarea--text-component"
                placeholder="Name"
                onChange={input.onChange}
                value={input.value}
            />
        )
    }

    render() {
        const { handleSubmit } = this.props
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <Field name="name"
                           component={this.renderTextarea} />
                    <button type="submit">Submit</button>
                </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted } = props

    return {
        initialValues: {name:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_name_form'})(SprintNameForm))

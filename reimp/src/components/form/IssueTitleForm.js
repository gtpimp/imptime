import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import '../../sass/text-component.scss'

class IssueTitleForm extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
        /* this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)*/
    }

    /* onChangeAndSubmit(e, fieldOnChange) {
     *     const {handleSubmit} = this.props
     *     debugger
     *     fieldOnChange(e)
     *     // setTimeout(() => handleSubmit(), 0)
     * }*/
    
    renderTextarea(field) {
        const {input, data, onChange, ...rest} = field
        return (
            <Textarea
                rows="1"
                maxLength="3000"
                className="textarea textarea--text-component textarea--title"
                placeholder="Title"
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
                    <Field name="title"
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
        initialValues: {title:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_title_form'})(IssueTitleForm))


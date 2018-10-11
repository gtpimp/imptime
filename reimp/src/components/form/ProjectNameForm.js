import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import TextAreaField from './TextAreaField'
import '../../sass/text-component.scss'
import '../../sass/project_sidebar.css'

class ProjectNameForm extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
        /* this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this) */
    }

    // If this has not been required by 01/06/18, please delete
    /* onChangeAndSubmit(e, fieldOnChange) {
     *     fieldOnChange(e)
     *     // setTimeout(() => handleSubmit(), 0)
     * } */
    
    renderTextarea(field) {
        const {input} = field
        return (
            <TextAreaField
                rows="1"
                maxLength="300"
                className="textarea textarea--text-component textarea--title"
                placeholder="Project Name"
                onChange={input.onChange}
                value={input.value}
                autoFocus
            />
        )
    }
    
    render() {
        const { handleSubmit, onCancel } = this.props
        return (
            <form onSubmit={handleSubmit}>
              <div className="project_sidebar--form">
                <div className="project_sidebar--textarea">
                  <Field name="name"
                         component={this.renderTextarea} />
                </div>
                <div className="project_sidebar__button_row">
                  <button className="button project_sidebar--textarea" type="submit">Submit</button>
                  <button className="button project_sidebar--textarea" type="button" onClick={() => onCancel()}>Cancel</button>
                </div>

              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onCancel } = props
    
    return {
        initialValues: {name:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onCancel
    }
}

export default connect(mapStateToProps)(reduxForm({form:'project_name_form'})(ProjectNameForm))


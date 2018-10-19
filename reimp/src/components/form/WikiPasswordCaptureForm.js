import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import '../../sass/text-component.scss'

class WikiPasswordCaptureForm extends Component {

    renderInput = (field) => {
        const {input} = field
        return (
            <input type="password"
                   value={input.value}
                   onChange={input.onChange}
                   placeholder="Password"
                   className="textarea textarea--text-component textarea--title"
                   autoFocus
            />
        )
    }

    render() {
        const { handleSubmit, onCancel } = this.props
        return (
            <form onSubmit={handleSubmit}>
              <div className="feature_sidebar--form">
                <h2>Enter the password:</h2>
                <div className="feature_sidebar--textarea">
                  <Field name="password"
                         component={this.renderInput} />
                </div>
                  <div className="feature_sidebar__button_row">
                    <button className="button feature_sidebar--textarea" type="submit">Submit</button>
                    <button className="button feature_sidebar--textarea" type="button" onClick={() => onCancel()}>Cancel</button>
                  </div>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onCancel } = props

    return {
        initialValues: {},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onCancel: onCancel,
    }
}

export default connect(mapStateToProps)(reduxForm({form:'wiki-password-capture-form'})(WikiPasswordCaptureForm))

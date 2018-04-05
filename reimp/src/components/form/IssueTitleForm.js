import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import IssueTitleField from './IssueTitleField';

class IssueTitleForm extends Component {

    render() {
        const { handleSubmit, onKeyDown, onCancel } = this.props

        return (
            <form onSubmit={handleSubmit}>
              <div>
                <IssueTitleField onKeyDown={onKeyDown} />
                <div className="issue_sidebar__button_row">
                  <button className="button issue_sidebar--textarea" type="submit">Submit</button>
                  <button className="button issue_sidebar--textarea" onClick={onCancel}>Cancel</button>
                </div>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onKeyDown, onCancel } = props

    return {
        initialValues: {title:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onCancel,
        onKeyDown
        
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_title_form'})(IssueTitleForm))

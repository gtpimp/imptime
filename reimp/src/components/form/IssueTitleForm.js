import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import IssueTitleField from './IssueTitleField';

class IssueTitleForm extends Component {

    render() {
        const { handleSubmit, onKeyDown } = this.props

        return (
            <form onSubmit={handleSubmit}>
              <div>
                <IssueTitleField onKeyDown={onKeyDown} />
                <button className="button issue_sidebar--textarea" type="submit">Submit</button>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onKeyDown } = props

    return {
        initialValues: {title:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onKeyDown
        
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_title_form'})(IssueTitleForm))

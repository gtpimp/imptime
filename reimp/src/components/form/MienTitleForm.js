import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm } from 'redux-form';
import MienTitleField from './MienTitleField';

class MienTitleForm extends Component {

    render() {
        const { handleSubmit, onKeyDown, onCancel } = this.props

        return (
            <form onSubmit={handleSubmit}>
              <div>
                <MienTitleField onKeyDown={onKeyDown} />
                <div className="mien_sidebar__button_row">
                  <button className="button mien_sidebar--textarea" type="submit">Submit</button>
                  <button className="button mien_sidebar--textarea" onClick={onCancel}>Cancel</button>
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

export default connect(mapStateToProps)(reduxForm({form:'mien_title_form'})(MienTitleForm))


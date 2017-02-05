import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import '../../sass/text-component.scss'


class IssueTitleForm extends Component {

    render() {

        const { initialValues, handleSubmit } = this.props
        
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    {/*<Field name="title" component="input" type="text"/>*/}
                    <div className="text-component--edit">
                  <Textarea
                      rows="1"
                      maxLength="3000"
                      className="textarea textarea--text-component"
                      placeholder="Title"
                      onChange={ this.handleChange }
                      value={initialValues} />
                    </div>
                </div>
                <button type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onChange } = props
    
    return {
        initialValues: {title:props.initial_value},
        enableReinitialize: true,
        onSubmit: onChange
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_title_form'})(IssueTitleForm))


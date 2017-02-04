import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form';


class IssueCommentForm extends Component {

    render() {

        const { initialValues, handleSubmit } = this.props
        
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="comment">Comment</label>
                    <Field name="comment" component="textarea" type="text"/>
                </div>
                <button type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onChange } = props
    
    return {
        initialValues: {comment:props.initial_value},
        enableReinitialize: true,
        onSubmit: onChange
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_comment_form'})(IssueCommentForm))


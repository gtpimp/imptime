import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import Textarea from 'react-expanding-textarea'

class IssueCommentForm extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
    }

    onChangeAndSubmit(e, fieldOnChange) {
        fieldOnChange(e)
        // setTimeout(() => handleSubmit(), 0)
    }
    
    renderTextarea(field) {
        const {input} = field
        return (
            <Textarea
                rows="1"
                maxLength="3000"
                className="textarea textarea--text-component"
                placeholder="Comment"
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
            />
        )
    }
    
    render() {

        const { handleSubmit } = this.props
        
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="comment">Comment</label>
                    <Field name="comment"
                           component={this.renderTextarea} />
                </div>
                <button type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted } = props
    
    return {
        initialValues: {comment:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_comment_form'})(IssueCommentForm))


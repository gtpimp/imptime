import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import { getIssue } from '../../actions/Issues'

class IssueCommentForm extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
        this.keyDown = this.keyDown.bind(this)
    }

    onChangeAndSubmit(e, fieldOnChange) {
        fieldOnChange(e)
        // setTimeout(() => handleSubmit(), 0)
    }

    keyDown(event) {
        const { onKeyDown } = this.props
        if (onKeyDown) {
            onKeyDown(event)
        }
    }

    renderTextarea(field) {
        const {input} = field
        return (
            <Textarea
                rows="1"
                maxLength="3000"
                className="textarea textarea--text-component textarea--comment"
                placeholder="Comment"
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                onKeyDown={this.keyDown}
            />
        )
    }

    render() {

        const { handleSubmit } = this.props

        return (
            <form onSubmit={handleSubmit}>
              <div>
                <div className="issue_sidebar--textarea">
                  <Field name="comment"
                         component={this.renderTextarea} />
                </div>
              </div>
              <button type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {
    const { onSubmitted, issue_id, comment } = props
    const { issue } = state;
    const loading_item_id = issue.loading_item_ids || {}
    const initial_value = comment.comment;

    return {
        comment: comment,
        initialValues: {comment:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        initial_value: initial_value,
        loading_item_id: loading_item_id
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_comment_form'})(IssueCommentForm))

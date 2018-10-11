import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import TextAreaField from './TextAreaField'
import OtherUser from '../../components/OtherUser'

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
            <TextAreaField
                rows="1"
                className="textarea textarea--text-component textarea--comment"
                placeholder="Comment"
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                onKeyDown={this.keyDown}
            />
        )
    }

    render() {

        const { comment, handleSubmit, onCancel } = this.props

        return (
            <div>
              { comment &&
                <div className="text-component--readonly text-component--comment">
                  <div className="issue_sidebar--comment_date" >
                    {comment.modified} - <div className="issue_sidebar--comment_author">
                    <OtherUser user_id={comment.author_id} /></div>
                  </div>
                </div>
              }
              <form onSubmit={handleSubmit}>
                <div>
                  <div className="issue_sidebar--textarea">
                    <Field name="comment"
                           component={this.renderTextarea} />
                  </div>
                </div>
                <div className="issue_sidebar__button_row">
                  <button className="button issue_sidebar--textarea" type="submit">Submit</button>
                  <button className="button issue_sidebar--textarea" onClick={onCancel}>Cancel</button>
                </div>
              </form>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { onSubmitted, comment, onCancel } = props
    /* const loading_item_id = issue.loading_item_ids || {}*/
    /* const initial_value = comment.comment;*/

    return {
        comment: comment,
        initialValues: {comment:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onCancel: onCancel
        /* initial_value: initial_value,
         * loading_item_id: loading_item_id*/
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_comment_form'})(IssueCommentForm))

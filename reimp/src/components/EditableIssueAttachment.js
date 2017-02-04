import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import TextComponent from './TextComponent'
import EditableProperty from '../form/EditableProperty'
import { isEditing, isReadonly } from '../actions/EditableProperty'
import { deleteIssueAttachment } from '../actions/Issue'
import IssueAttachmentForm from '../form/IssueAttachmentForm'
import FileLabel from '../form/FileLabel'
import Blank from '../form/Blank'
import { getIssue } from '../actions/Issues'

class EditableIssueAttachment extends Component {

    constructor(props) {
        super(props)
        this.onDelete = this.onDelete.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    onChange() {
        // do nothing, the file has already been uploaded by the
        // IssueAttachmentForm
    }

    onDelete(new_value) {
        const { dispatch, issue_id, attachment_id } = this.props
        dispatch(deleteIssueAttachment(issue_id, attachment_id))
    }

    render() {
        const {issue_id, attachment} = this.props

	return (

            <div>
                <EditableProperty property_key={'issue_attachment_'+attachment.id}
                                  initial_value={attachment}
                                  onChange={this.onChange}
                >
                    <IssueAttachmentForm issue_id={issue_id} />
                    <FileLabel />
                    <Blank />
                </EditableProperty>
                { attachment.id && <button onClick={this.onDelete}>delete</button> }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { issue_id, attachment_id } = props
    const issue = getIssue(state, issue_id) || {}
    let attachment = { id: null}
    map(issue.attachments || [], function(issue_attachment, index) {
        if ( issue_attachment.id == attachment_id ) {
            attachment = issue_attachment
        }
    })
    
    return {
        issue_id: issue_id,
        attachment_id: attachment_id,
        attachment: attachment
    }
}


export default connect(mapStateToProps)(EditableIssueAttachment)

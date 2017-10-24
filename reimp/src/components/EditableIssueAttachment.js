import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import EditableProperty from './form/EditableProperty'
import { deleteIssueAttachment, getIssue } from '../actions/Issues'
import IssueAttachmentForm from './form/IssueAttachmentForm'
import FileLabel from './form/FileLabel'
import Blank from './form/Blank'

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
                                  can_edit={true}
                                  onChange={this.onChange}
                >
                  <IssueAttachmentForm issue_id={issue_id} />
                  <div>
                    { attachment.id &&
                      <FileLabel value={attachment}
                                 extra_buttons={[<button onClick={this.onDelete}>delete</button>]}
                      />
                    }
                    { ! attachment.id &&
                      <IssueAttachmentForm issue_id={issue_id} />
                    }
                  </div>
                  <Blank />
                </EditableProperty>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { issue_id, attachment_id } = props
    const issue = getIssue(state, issue_id) || {}
    let attachment = { id: null}
    map(issue.attachments || [], function(issue_attachment, index) {
        if ( issue_attachment.id === attachment_id ) {
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

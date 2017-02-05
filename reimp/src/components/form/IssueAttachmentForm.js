import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm } from 'redux-form'
import FileUpload from 'react-fileupload'
import { populateDefaultRequestHeaders } from '../../actions/lib'


class IssueAttachmentForm extends Component {

    render() {

        const { upload_url, requestHeaders, issue_id } = this.props
        
        return (
            <div>
                <label htmlFor="attachment">Attachment</label>
                <FileUpload
                    options={{baseUrl: upload_url,
                              requestHeaders: requestHeaders,
                              paramAddToField:{issue_id: issue_id},
                              dataType : 'json',
                              wrapperDisplay : 'inline-block',
                              uploading : function(progress){
                                  console.log('loading...',progress.loaded/progress.total+'%')
                              },
                              uploadSuccess : function(resp){
                                  console.log('upload success..!')
                              },
                              uploadError : function(err){
                                  alert(err.message)
                              },
                              uploadFail : function(resp){
                                  alert(resp)
                              },
                              doUpload : function(files,mill){
                                  console.log('you just uploaded',typeof files === 'string' ? files : files[0].name)
                              }
                    }}
                >
                    <button ref="chooseBtn">choose</button>
                    <button ref="uploadBtn">upload</button>
                </FileUpload>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { onChange, issue_id } = props
    const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
    const upload_url = API_BASE_URL + 'imp/issue/attachment/'

    const requestHeaders = {}
    populateDefaultRequestHeaders(requestHeaders)
    
    return {
        onSubmit: onChange,
        upload_url: upload_url,
        requestHeaders: requestHeaders,
        issue_id: issue_id
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_attachment_form'})(IssueAttachmentForm))

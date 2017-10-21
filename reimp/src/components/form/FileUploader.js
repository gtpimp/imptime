import React, {Component} from 'react'
import {connect} from 'react-redux'
import FileUpload from 'react-fileupload'
import { populateDefaultRequestHeaders } from '../../actions/lib'

class FileUploader extends Component {

    render() {

        const { upload_url, upload_params, request_headers } = this.props
        
        return (

            <FileUpload
                options={{baseUrl: upload_url,
                          requestHeaders: request_headers,
                          paramAddToField:upload_params,
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
        )
    }
}

function mapStateToProps(state, props) {
    const { upload_relative_url, upload_params } = props

    const request_headers = {}
    populateDefaultRequestHeaders(request_headers)

    const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
    const upload_url = API_BASE_URL + upload_relative_url
    
    return {
        upload_url,
        upload_params,
        request_headers
    }
}


export default connect(mapStateToProps)(FileUploader)

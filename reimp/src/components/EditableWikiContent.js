import React, {Component} from 'react'
import {connect} from 'react-redux'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import EditableProperty from './form/EditableProperty'
import WikiForm from './form/WikiForm'
import {
    updateWikiContent,
    getWiki,
    ensureWikisLoaded,
    encryptContent,
    decryptContent
} from '../actions/Wikis'
import { ensureProjectsLoaded } from '../actions/Projects'
import { has_permission } from '../actions/Users'
import RenderedWiki from './RenderedWiki'
import ModalDialog from './ModalDialog'
import WikiPasswordCaptureForm from './form/WikiPasswordCaptureForm'

class EditableWikiContent extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.state = { 'temporary_encryption_password': null,
                       'unencrypted_content': null,
                       'password_mode': null,
                       'is_getting_password': false }
    }

    componentDidMount() {
        this.refresh()
    }
    
    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { project_id, wiki_id, dispatch } = props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureWikisLoaded([wiki_id]))
    }

    onChange(new_value) {
        const { dispatch, wiki, wiki_id } = this.props
        this.setState({unencrypted_content: new_value.content})
        if ( wiki.store_encrypted === true ) {
            this.trySaveEncrypted()
        } else {
            dispatch(updateWikiContent(wiki_id, new_value.content))
        }
    }

    trySaveEncrypted = (new_password) => {
        const { dispatch, wiki_id } = this.props
        const { temporary_encryption_password, unencrypted_content } = this.state
        const password = new_password || temporary_encryption_password
        if ( password === null ) {
            this.setState({is_getting_password: true,
                           password_mode: 'encrypting'})
        } else {
            this.setState({is_getting_password: false,
                           password_mode: null})
            const encrypted_content = encryptContent(unencrypted_content, password)
            if ( encrypted_content === null ) {
                window.alert("Encryption failed")
            } else {
                dispatch(updateWikiContent(wiki_id, encrypted_content))
            }
        }
    }

    onDecrypt = (evt) => {
        evt.preventDefault()
        this.tryLoadEncrypted()
    }

    tryLoadEncrypted = (new_password) => {
        const { wiki } = this.props
        const { temporary_encryption_password } = this.state
        const password = new_password || temporary_encryption_password
        if ( password === null ) {
            this.setState({is_getting_password: true,
                           password_mode: 'decrypting'})
        } else {
            this.setState({password_mode: null})
            const decrypted_content = decryptContent(wiki.content, password)
            if ( decrypted_content.length === 0 ) {
                this.setState({temporary_encryption_password: null})
                window.alert("Wrong password")
            } else {
                wiki.content = decrypted_content
                this.setState({unencrypted_content: decrypted_content})
            }
        }
    }

    onPasswordSet = (values) => {
        const { password } = values
        const { password_mode } = this.state
        this.setState({temporary_encryption_password: password,
                       is_getting_password: false,
                       password_mode: null})

        if ( password_mode === 'encrypting' ) {
            this.trySaveEncrypted(password)
        } else if ( password_mode === 'decrypting' ) {
            this.tryLoadEncrypted(password)
        }
    }

    onCancelSetPassword = () => {
        this.setState({is_getting_password: false})
    }

    renderGetPassword() {
        return (
            <ModalDialog isOpen={true}
                         onClose={this.onCancelSetPassword}
            >
              
              <WikiPasswordCaptureForm onSubmitted={this.onPasswordSet}
                                       onCancel={this.onCancelSetPassword}
                                       title={"Enter wiki password"}
              />
            </ModalDialog>
        )
    }

    render() {
        const { wiki, can_edit, project_id } = this.props
        const { is_getting_password, unencrypted_content } = this.state

        const content = (wiki.content || "").trim()

        if ( is_getting_password ) {
            return this.renderGetPassword()
        }
        
        return (
            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_business_comments'>
              <PermissionInspectorHighlighter project_id={project_id}
                                              permission_name='has_view_business_comments'>
                <EditableProperty property_key={'wiki_content_'+wiki.id}
                                  initial_value={content}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                >
                  <WikiForm />
                  <RenderedWiki wiki_id={wiki.id} />
                  <div className="text-component--empty text-component--description">
                    Click to edit
                  </div>
                </EditableProperty>
                { wiki && wiki.content && wiki.store_encrypted && unencrypted_content === null && 
                  <button onClick={this.onDecrypt}>Decrypt</button>
                }
              </PermissionInspectorHighlighter>
            </PermissionInspectorHighlighter>
        )
    }

}

function mapStateToProps(state, props) {
    const { wiki_id } = props
    const wiki = getWiki(state, wiki_id) || {}
    const project_id = wiki.project_id
    const can_edit = has_permission(state, project_id, 'has_edit_business_comments')
    const can_view = has_permission(state, project_id, 'has_view_business_comments')
    return {
        wiki,
        project_id,
        can_edit,
        can_view
    }
}


export default connect(mapStateToProps)(EditableWikiContent)

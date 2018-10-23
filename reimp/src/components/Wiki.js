import React, { Component } from 'react'
import { connect } from 'react-redux'
import { size } from 'lodash'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import {
    ensureWikisLoaded,
    getWiki,
    updateWikiMoneySensitive,
    updateWikiStoreEncrypted
} from '../actions/Wikis'

import EditableWikiContent from './EditableWikiContent'
import EditableWikiName from './EditableWikiName'
import ToggleButton from './toolbar/ToggleButton'
import { has_permission } from '../actions/Users'
import VisualSpecDocumentGallery from './visual_spec/VisualSpecDocumentGallery'
import VisualSpecDocumentForm from './visual_spec/VisualSpecDocumentForm'
import SidebarSectionTitle from './SidebarSectionTitle'
import SidebarProperty from './SidebarProperty'
import SidebarAddButton from './SidebarAddButton'

class Wiki extends Component {

    constructor(props) {
        super(props)
        this.onCommerciallySensitiveClick = this.onCommerciallySensitiveClick.bind(this)
        this.onStoreEncryptedClick = this.onStoreEncryptedClick.bind(this)
        this.state = {adding_visual_spec_doc: false}
    }
    
    componentDidMount() {
	const { dispatch, wiki_id } = this.props
	dispatch(ensureWikisLoaded([wiki_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, wiki_id } = new_props
	dispatch(ensureWikisLoaded([wiki_id]))
    }

    onCommerciallySensitiveClick(is_commercially_sensitive) {
        const { dispatch, wiki_id } = this.props
        dispatch(updateWikiMoneySensitive(wiki_id, is_commercially_sensitive))
    }

    showAddVisualSpecDoc = () => {
        this.setState({adding_visual_spec_doc:true})
    }

    hideAddVisualSpecDoc = () => {
        this.setState({adding_visual_spec_doc:false})
    }

    onStoreEncryptedClick(store_encrypted) {
        const { dispatch, wiki_id, wiki } = this.props
        if ( size(wiki.content)>0 ) {
            window.alert("Can't change encryption mechanism unless the wiki is empty")
        } else {
            dispatch(updateWikiStoreEncrypted(wiki_id, store_encrypted))
        }
    }

    renderAttachmentsStack() {
        const { wiki, project_id } = this.props
        const adding_visual_spec_doc = this.state.adding_visual_spec_doc
        return (
            <SidebarProperty key="attachmentstack">
              <SidebarSectionTitle title="Attachments" />
              <VisualSpecDocumentGallery annotated_visual_spec_document_ids={wiki.annotated_visual_spec_document_ids}
                                         wiki_id={wiki.id}
                                         allow_edit={false} />
              
              { ! adding_visual_spec_doc && (
                    <SidebarAddButton
                        data-tooltip="Upload attachment"
                        onButtonClick={this.showAddVisualSpecDoc}
                        label="Add attachment" />
                )}
              { adding_visual_spec_doc && (
                    <div>
                      <VisualSpecDocumentForm wiki_id={wiki.id}
                                              project_id={project_id}
                                              onChange={this.hideAddVisualSpecDoc}
                      />
                      <button className="button button--primary" onClick={this.hideAddVisualSpecDoc}>Cancel</button>
                    </div>
                )}
            </SidebarProperty>
        )
    }
    
    render() {

        const { wiki, can_edit, can_view_sensitive_wikis } = this.props

        if ( ! wiki.id ) {
            return null
        }
        
        return (
            <div className="wiki">
              <div className="wiki-header">
                <div className="wiki-header__name"> 
                  <EditableWikiName wiki_id={wiki.id} />
                </div>
                { can_edit && can_view_sensitive_wikis &&
                  <PermissionInspectorHighlighter project_id={wiki.project_id}
                                                  permission_name='has_view_ctc_billable_rates'>
                    <div className="wiki-header__commercially_sensitive">
                      <ToggleButton value={wiki.money_sensitive}
                                    onChange={this.onCommerciallySensitiveClick}
                                    on_label={"Financial"}
                                    off_label={"Regular"} />
                    </div>
                  </PermissionInspectorHighlighter>
                }
                { can_edit &&
                  <div className="wiki-header__secure">
                    <ToggleButton value={wiki.store_encrypted}
                                  onChange={this.onStoreEncryptedClick}
                                  on_label={"Encrypted"}
                                  off_label={"Visible"} />
                  </div>
                }
              </div>
              <div className="wiki__content">
                { !can_view_sensitive_wikis && wiki.money_sensitive &&
                  <div className="error">Sensitive content hidden</div>
                }

                { (can_view_sensitive_wikis || !wiki.money_sensitive) &&
                  <EditableWikiContent wiki_id={wiki.id} />
                }
              </div>
              { this.renderAttachmentsStack() }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { wiki_id } = props
    const wiki = getWiki(state, wiki_id) || {}
    const can_edit = has_permission(state, wiki.project_id, 'has_edit_business_comments')
    const can_view_sensitive_wikis = has_permission(state, wiki.project_id, 'has_view_ctc_billable_rates')
    const project_id = wiki && wiki.project_id

    return {
        wiki,
        is_loading: !wiki.id,
        can_edit,
        can_view_sensitive_wikis,
        project_id
    }
}

export default connect(mapStateToProps)(Wiki)

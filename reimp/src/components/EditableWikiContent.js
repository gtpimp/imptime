import React, {Component} from 'react'
import {connect} from 'react-redux'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import EditableProperty from './form/EditableProperty'
import WikiForm from './form/WikiForm'
import { updateWikiContent, getWiki, ensureWikisLoaded } from '../actions/Wikis'
import { ensureProjectsLoaded } from '../actions/Projects'
import { has_permission } from '../actions/Users'
import RenderedWiki from './RenderedWiki'

class EditableWikiContent extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
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
        const { dispatch, wiki_id } = this.props
        dispatch(updateWikiContent(wiki_id, new_value.content))
    }

    render() {
        const { wiki, can_edit, project_id } = this.props

        const content = (wiki.content || "").trim()
        
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

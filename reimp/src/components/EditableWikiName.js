import React, {Component} from 'react'
import {connect} from 'react-redux'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import EditableProperty from './form/EditableProperty'
import WikiNameForm from './form/WikiNameForm'
import { updateWikiName, getWiki, ensureWikisLoaded } from '../actions/Wikis'
import { ensureProjectsLoaded } from '../actions/Projects'
import { has_permission } from '../actions/Users'
import ReactMarkdown from 'react-markdown'

const renderers = {
    link: (props) => {
        return (
          <a href={props.href}
             target="_blank"
             onClick={(event) => event.stopPropagation()}>
             {(props.children && props.children[0]) || props.href}
          </a> 
        )
    }
}

class EditableWikiName extends Component {

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
        dispatch(updateWikiName(wiki_id, new_value.name))
    }

    render() {
        const { wiki, can_edit, project_id } = this.props

        const name = (wiki.name || "").trim()
        
        return (
            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_business_comments'>
              <EditableProperty property_key={'wiki_name_'+wiki.id}
                                initial_value={name}
                                onChange={this.onChange}
                                edit_as_modal={true}
                                can_edit={can_edit}
              >
                <WikiNameForm />
                <div className="text-component--readonly">
                  <ReactMarkdown source={name} renderers={renderers} />
                </div>
                <div className="text-component--empty">
                  No name
                </div>
              </EditableProperty>
            </PermissionInspectorHighlighter>
        )
    }

}
 
function mapStateToProps(state, props) {
    const { wiki_id } = props
    const wiki = getWiki(state, wiki_id) || {}
    const project_id = wiki.project_id
    const can_edit = has_permission(state, project_id, 'has_edit_business_comments')
    return {
        wiki: wiki,
        project_id: project_id,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableWikiName)

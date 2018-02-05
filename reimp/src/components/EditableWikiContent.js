import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import WikiForm from './form/WikiForm'
import { updateWikiContent, getWiki, ensureWikisLoaded } from '../actions/Wikis'
import { getProject, ensureProjectsLoaded } from '../actions/Projects'
import { has_permission } from '../actions/Users'
import Blank from './form/Blank'
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
        const { wiki, can_edit } = this.props

        const content = (wiki.content || "").trim()
        
        return (
            <EditableProperty property_key={'wiki_content_'+wiki.id}
                              initial_value={content}
                              onChange={this.onChange}
                              can_edit={can_edit}
            >
              <WikiForm />
              <div className="text-component--readonly text-component--description">
                <ReactMarkdown source={content} renderers={renderers} />
              </div>
              <div className="text-component--empty text-component--description">
                Click to edit
              </div>
            </EditableProperty>
        )
    }

}

function mapStateToProps(state, props) {
    const { wiki_id } = props
    const wiki = getWiki(state, wiki_id) || {}
    const project_id = wiki.project_id
    const project = getProject(state, project_id) || {}
    const can_edit = has_permission(state, project_id, 'has_edit_business_comments')
    return {
        wiki: wiki,
        project_id: project_id,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableWikiContent)

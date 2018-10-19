import React, { Component } from 'react'
import { connect } from 'react-redux'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import { getWiki, ensureWikisLoaded } from '../actions/Wikis'
import RenderedMarkdown from './RenderedMarkdown'
import { has_permission } from '../actions/Users'

class RenderedWiki extends Component {

    componentDidMount() {
        this.refresh(this.props)
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(props) {
	const { dispatch, project_id, wiki_id } = props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureWikisLoaded([wiki_id]))
    }

    render() {
        const { wiki, unencrypted_content } = this.props

        const content = (unencrypted_content || "").trim() || (wiki.enriched_content || "").trim() || (wiki.content || "").trim()
        return (
            <div className="text-component--readonly text-component--description">
              <RenderedMarkdown content={content} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { wiki_id, unencrypted_content } = props
    const wiki = getWiki(state, wiki_id) || {}
    const project_id = wiki.project_id
    const project = getProject(state, project_id) || {}
    const can_view = has_permission(state, project_id, 'has_view_business_comments')

    return {
	project: project,
        project_id: project_id,
        can_view,
        wiki,
        wiki_id,
        unencrypted_content
    }
}

export default connect(mapStateToProps)(RenderedWiki)

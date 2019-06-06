import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { get, includes, compact } from 'lodash'
import {setProjectBreadcrumbsHelper} from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureWikisLoaded, getWiki} from '../actions/Wikis'
import ProjectWikiList from '../components/ProjectWikiList'
import NewWikiSidebar from '../components/NewWikiSidebar'
import Splitter from '../components/Splitter'
import {
    PAGE_KEY__PROJECT_WIKI_PAGE,
    LIST_KEY__WIKI_LIST
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    setPageSelectedEntities,
    getPageSelectedEntities,
    getPageFlag
} from '../actions/Page'
import { selectItems } from '../actions/ItemList'
import { getCandidateWiki } from '../actions/Wikis'
import Wiki from '../components/Wiki'

class ProjectWikiPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectWiki = this.onSelectWiki.bind(this)
    }

    componentDidMount() {
        const {dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__PROJECT_WIKI_PAGE, ['project-wiki']))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { project_id, wiki_id, default_wiki_id } = this.props
        if ( new_props.project_id !== project_id || new_props.project.id !== this.props.project.id ||
             new_props.wiki_id !== wiki_id || new_props.wiki.id !== this.props.wiki.id) {
            this.refresh(new_props)
        } else {
            if ( this.state && this.state.noticed_default_wiki_id !== default_wiki_id ) {
                this.selectDefaultWiki(new_props)
            }
        }
    }
    
    refresh(these_props) {
        const { project_id, project, wiki_id, default_wiki_id, dispatch } = these_props || this.props
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            if ( project.id ) {
                dispatch(setProjectBreadcrumbsHelper(project))
            }
            if ( wiki_id ) {
                dispatch(ensureWikisLoaded([wiki_id]))
            }
            let check_wiki_id = wiki_id != null ? "" + wiki_id : wiki_id
            dispatch(setPageSelectedEntities(PAGE_KEY__PROJECT_WIKI_PAGE,
                                     {project_ids: compact([project_id]),
                                      wiki_ids: compact([check_wiki_id])}))
        }
        this.setState({'noticed_default_wiki_id': default_wiki_id})
    }

    selectDefaultWiki(these_props) {
        const {dispatch, project_id, selected_wiki_ids, default_wiki_id} = these_props || this.props
        if ( default_wiki_id !== undefined && !includes(selected_wiki_ids, default_wiki_id) ) {
            dispatch(selectItems(LIST_KEY__WIKI_LIST, [default_wiki_id]))
            
            dispatch(setPageSelectedEntities(PAGE_KEY__PROJECT_WIKI_PAGE,
                                     {project_ids: [project_id],
                                      wiki_ids: [""+default_wiki_id]}))
        }
        this.setState({'noticed_default_wiki_id': default_wiki_id})
    }

    onSelectWiki(wiki_id) {
        const { dispatch, history, project_id } = this.props
        dispatch(selectItems(LIST_KEY__WIKI_LIST, wiki_id))
        dispatch(setPageSelectedEntities(PAGE_KEY__PROJECT_WIKI_PAGE,
                                 {project_ids: [project_id],
                                  wiki_ids: [""+wiki_id]}))
        history.push('/projects/'+project_id+'/wiki/'+wiki_id);
    }

    navigateToWikisPage() {
        const { project_id, history } = this.props
        history.push('/projects/'+project_id+'/wiki');
    }

    renderContentsPane() {
        const { is_creating_wiki, project_id, selected_wiki_ids } = this.props

        if ( is_creating_wiki ) {
            return (
                <div className="list-layout__sidebar">
                  <NewWikiSidebar onCreatedWiki={this.onSelectWiki} project_id={project_id} />
                </div>
            )
        } else {
            return (
                <ProjectWikiList list_key={LIST_KEY__WIKI_LIST}
                                 selected_wiki_ids={selected_wiki_ids}
                                 project_id={project_id}
                                 onSelectWiki={this.onSelectWiki}/>
            )
        }
    }

    renderDetailsPane() {
        const { wiki_id } = this.props
        return (
            <div>
              <div>
                <div className="project-wiki__project_wiki_details">
                  { wiki_id && <Wiki wiki_id={wiki_id}/> }
                </div>
              </div>
            </div>
        )
    }

    render() {
        const { show_sidebar } = this.props

        if ( show_sidebar ) {
            return (
                <Splitter name="project_wiki_page" defaultSize="20%">
                  {this.renderContentsPane()}
                  {this.renderDetailsPane()}
                </Splitter>
            )
        }
        if ( ! show_sidebar ) {
            return (
                <Splitter>
                  {this.renderDetailsPane()}
                  {null}
                </Splitter>
            )
        }
    }
}

function mapStateToProps(state, props) {
    const project_id = props.match.params.projectId
    const default_wiki_id = props.match.params.wikiId
    const project = getProject(state, project_id)

    const candidate_wiki = getCandidateWiki(state) || null
    const is_creating_wiki = candidate_wiki || false
    const show_sidebar = getPageFlag(state, PAGE_KEY__PROJECT_WIKI_PAGE, "show_sidebar", true)
    const selected_wiki_ids = get(getPageSelectedEntities(state, PAGE_KEY__PROJECT_WIKI_PAGE), ["wiki_ids"])
    const selected_wiki_id = ( selected_wiki_ids && selected_wiki_ids.length > 0 && selected_wiki_ids[0] ) || default_wiki_id || null
    const selected_wiki = getWiki(state, selected_wiki_id)
        
    return {
        project_id: project_id,
        project: project || {},
        wiki_id: selected_wiki_id,
        wiki: selected_wiki || {},
        wiki_name: (selected_wiki || {}).name,
        is_creating_wiki: is_creating_wiki,
        show_sidebar: show_sidebar || is_creating_wiki,
        selected_wiki_ids,
        default_wiki_id
    }
}

export default withRouter(connect(mapStateToProps)(ProjectWikiPage))

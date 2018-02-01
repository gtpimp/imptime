import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { includes } from 'lodash'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureWikisLoaded, getWiki} from '../actions/Wikis'
import ProjectWikiList from '../components/ProjectWikiList'
import NewWikiSidebar from '../components/NewWikiSidebar'
import SplitPane from 'react-split-pane'
import {
    PAGE_KEY__PROJECT_WIKI_PAGE,
    LIST_KEY__WIKI_LIST
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    select_projects,
    select_wikis,
    setPageFlag,
    getPageFlag,
    get_selected_wiki_ids,
} from '../actions/Page'
import { update_list_filter, selectItems, getListFilter } from '../actions/ItemList'
import { getCandidateWiki } from '../actions/Wikis'
import Wiki from '../components/Wiki'

class ProjectWikiPage extends Component {

    constructor(props) {
        super(props)
        this.onChangeSplitterSize = this.onChangeSplitterSize.bind(this)
        this.onSelectWiki = this.onSelectWiki.bind(this)
    }

    componentDidMount() {
        const {dispatch, project_id} = this.props
        dispatch(set_toolbars(PAGE_KEY__PROJECT_WIKI_PAGE, ['project-wiki']))
        this.refresh()
    }

    onChangeSplitterSize(size) {
        const { dispatch } = this.props
        dispatch(setPageFlag(PAGE_KEY__PROJECT_WIKI_PAGE, 'splitter_size', size))
    }

    componentWillReceiveProps(new_props) {
        const { project_id, wiki_id, default_wiki_id, dispatch } = this.props
        if ( new_props.project_id !== project_id || new_props.project.id !== this.props.project.id ||
             new_props.wiki_id !== wiki_id || new_props.wiki.id != this.props.wiki.id) {
            this.refresh(new_props)
        } else {
            if ( this.state && this.state.noticed_default_wiki_id != default_wiki_id ) {
                this.selectDefaultWiki(new_props)
            }
        }
    }
    
    refresh(these_props) {
        const { project_id, project, wiki_id, wiki, default_wiki_id, dispatch, filter } = these_props || this.props
        const breadcrumbs = []
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            dispatch(select_projects(PAGE_KEY__PROJECT_WIKI_PAGE, [project_id]))
            if ( filter.project_id != project.id ) {
                dispatch(update_list_filter(LIST_KEY__WIKI_LIST, {project_id:project.id}))
            }
            
            breadcrumbs.push({to: '/projects', label: 'Projects'})
            if ( project_id === project.id ) {
                breadcrumbs.push({to: '/projects/'+project_id, label: project.name})
            }
            breadcrumbs.push({to: '/projects/'+project_id+'/wiki', label: 'Wiki'})
            if ( wiki_id ) {
                dispatch(ensureWikisLoaded([wiki_id]))
                if ( wiki_id === wiki.id ) {
                    breadcrumbs.push({to: '/projects/'+project_id+'/wiki/'+wiki_id, label: wiki.name})
                }
                dispatch(select_wikis(PAGE_KEY__PROJECT_WIKI_PAGE, [wiki_id]))
            }
        }
        this.setState({'noticed_default_wiki_id': default_wiki_id})
        dispatch(setBreadcrumbs(breadcrumbs))
    }

    selectDefaultWiki(these_props) {
        const {dispatch, selected_wiki_ids, default_wiki_id} = these_props || this.props
        if ( default_wiki_id != undefined && !includes(selected_wiki_ids, default_wiki_id) ) {
            dispatch(selectItems(LIST_KEY__WIKI_LIST, [default_wiki_id]))
            dispatch(select_wikis(PAGE_KEY__PROJECT_WIKI_PAGE, [default_wiki_id]))
        }
        this.setState({'noticed_default_wiki_id': default_wiki_id})
    }

    onSelectWiki(wiki_id) {
        const { dispatch, project_id } = this.props
        dispatch(selectItems(LIST_KEY__WIKI_LIST, wiki_id))
        dispatch(select_wikis(PAGE_KEY__PROJECT_WIKI_PAGE, [wiki_id]))
        browserHistory.push('/projects/'+project_id+'/wiki/'+wiki_id);
    }

    navigateToWikisPage() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/wiki');
    }

    renderContentsPane() {
        const { is_creating_wiki, project_id } = this.props

        if ( is_creating_wiki ) {
            return (
                <div className="list-layout__sidebar">
                  <NewWikiSidebar onCreatedWiki={this.onSelectWiki} project_id={project_id} />
                </div>
            )
        } else {
            return (
                <div>
                  <div>
                    <div className="project-wiki__project_wikis">
                      <ProjectWikiList list_key={LIST_KEY__WIKI_LIST}
                                       onSelectWiki={this.onSelectWiki}/>
                    </div>
                  </div>
                </div>
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
        const { project, wiki_id, show_sidebar, splitter_size } = this.props
        const that = this

        if ( show_sidebar ) {
            return (
                <div className="list-layout">
                  <SplitPane split="vertical" minSize={50} defaultSize={"20%"}
                             defaultSize={splitter_size}
                             onChange={this.onChangeSplitterSize}
                  >
                    <div className="left">
                      {this.renderContentsPane()}
                    </div>
                    <div className="right">
                      {this.renderDetailsPane()}
                    </div>
                  </SplitPane>
                </div>
            )
        }
        if ( ! show_sidebar ) {
            return (
                <div className="list-layout">
                  {this.renderDetailsPane()}
                </div>
            )
        }
    }
}

function mapStateToProps(state, props) {
    const project_id = props.params.projectId
    const default_wiki_id = props.params.wikiId
    const project = getProject(state, project_id)

    const candidate_wiki = getCandidateWiki(state) || null
    const is_creating_wiki = candidate_wiki || false
    const show_sidebar = getPageFlag(state, PAGE_KEY__PROJECT_WIKI_PAGE, "show_sidebar", true)
    const splitter_size = getPageFlag(state, PAGE_KEY__PROJECT_WIKI_PAGE, 'splitter_size', "20%")
    const selected_wiki_ids = get_selected_wiki_ids(state, PAGE_KEY__PROJECT_WIKI_PAGE)
    const selected_wiki_id = ( selected_wiki_ids && selected_wiki_ids.length > 0 && selected_wiki_ids[0] ) || default_wiki_id || null
    const selected_wiki = getWiki(state, selected_wiki_id)
    const filter = getListFilter(state, LIST_KEY__WIKI_LIST)
        
    return {
        project_id: project_id,
        project: project || {},
        wiki_id: selected_wiki_id,
        wiki: selected_wiki || {},
        wiki_name: (selected_wiki || {}).name,
        is_creating_wiki: is_creating_wiki,
        splitter_size,
        show_sidebar: show_sidebar || is_creating_wiki,
        filter,
        default_wiki_id
    }
}

export default connect(mapStateToProps)(ProjectWikiPage)

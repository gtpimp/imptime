import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureWikisLoaded, getWiki} from '../actions/Wikis'
import ProjectWikiList from '../components/ProjectWikiList'
import Modal from 'react-modal';
import {
    PAGE_KEY__PROJECT_WIKI_PAGE,
    LIST_KEY__WIKI_LIST
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    select_projects,
    select_wikis,
    setPageFlag,
    clearPageFlag,
    getPageFlag
} from '../actions/Page'
import { update_list_filter } from '../actions/ItemList'

class ProjectWikiPage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {dispatch, project_id, wiki_id} = this.props
        // dispatch(set_toolbars(PAGE_KEY__PROJECT_WIKI_PAGE, ['project-wiki']))
        this.refresh(project_id, wiki_id, null, null)
    }

    componentWillReceiveProps(new_props) {
        const { project_id, wiki_id, dispatch } = this.props
        if ( new_props.project_id !== project_id || new_props.project.id !== this.props.project.id ||
             new_props.wiki_id !== wiki_id || new_props.wiki.id != this.props.wiki.id) {
            this.refresh(new_props.project_id, new_props.wiki_id, new_props.project, new_props.wiki)
        }
    }
    
    refresh(project_id, wiki_id, project, wiki) {
        const { dispatch } = this.props
        const breadcrumbs = []
        project = project || {}
        wiki = wiki || {}
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            dispatch(select_projects(PAGE_KEY__PROJECT_WIKI_PAGE, [project_id]))
            dispatch(update_list_filter(LIST_KEY__WIKI_LIST, {project_id:project.id,
                                                              wiki_id:wiki_id}))
            
            breadcrumbs.push({to: '/projects', label: 'Projects'})
            if ( project_id === project.id ) {
                breadcrumbs.push({to: '/projects/'+project_id, label: project.name})
            }
            if ( wiki_id ) {
                dispatch(ensureWikisLoaded([wiki_id]))
                breadcrumbs.push({to: '/projects/'+project_id+'/wikis', label: 'Wikis'})
                if ( wiki_id === wiki.id ) {
                    breadcrumbs.push({to: '/projects/'+project_id+'/wikis/'+wiki_id, label: wiki.name})
                }
                dispatch(select_wikis(PAGE_KEY__PROJECT_WIKI_PAGE, [project_id]))
            }
        }
        dispatch(setBreadcrumbs(breadcrumbs))
    }

    navigateToWikisPage() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/wikis/');
    }

    render() {
        const { project, wiki_id } = this.props
        const that = this
        return (
            <div>
              <div>
                <div className="project-wiki__project_wikis">
                  <ProjectWikiList list_key={LIST_KEY__WIKI_LIST} />
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.params.projectId
    const wiki_id = props.params.wikiId
    const project = getProject(state, project_id)
    const wiki = getWiki(state, wiki_id)

    const opts = props.location.query
        
    return {
        project_id: project_id,
        project: project || {},
        wiki_id: wiki_id,
        wiki: wiki || {},
        wikiname: (wiki || {}).name
    }
}

export default connect(mapStateToProps)(ProjectWikiPage)

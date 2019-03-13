import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import ProjectList from '../components/ProjectList'
import ProjectSidebar from '../components/ProjectSidebar'
import NewProjectSidebar from '../components/NewProjectSidebar'
import MultipleProjectSidebar from '../components/MultipleProjectSidebar'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {
    LIST_KEY__PROJECT_LIST,
    PAGE_KEY__PROJECTS_PAGE,
    PROJECT_HEADER_LIST
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    setPageSelectedEntities,
    getPageSelectedEntities
} from '../actions/Page'
import {
    initList,
    selectItems,
    update_list_pagination,
} from '../actions/ItemList'
import {getCandidateProject} from '../actions/Projects'
import { setActivelyAvailableAutoClockEntity } from '../actions/AutoClock'
import Splitter from '../components/Splitter'

class ProjectsPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectProjects = this.onSelectProjects.bind(this)
    }

    componentDidMount() {
        const {dispatch, default_project_id} = this.props
        dispatch(set_toolbars(PAGE_KEY__PROJECTS_PAGE, ['projects'], "Project list"))
        dispatch(initList(LIST_KEY__PROJECT_LIST))        
        dispatch(update_list_pagination(LIST_KEY__PROJECT_LIST, {page_size:20}))
        if ( default_project_id !== undefined ) {
            dispatch(selectItems(LIST_KEY__PROJECT_LIST, [default_project_id]))
            dispatch(setPageSelectedEntities(PAGE_KEY__PROJECTS_PAGE,
                                     {project_ids:[default_project_id]}))
            dispatch(setActivelyAvailableAutoClockEntity(default_project_id))
        }
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { selected_project_ids } = new_props
        if ( selected_project_ids !== this.props.selected_project_ids ||
             (selected_project_ids && this.props.selected_project_ids && 
              (selected_project_ids.length !== this.props.selected_project_ids.length ||
               (selected_project_ids.length > 0 &&
                selected_project_ids[0] !== this.props.selected_project_ids[0])) )) {
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, selected_projects } = props
        let selected_project = null
        if ( selected_projects && selected_projects.length === 1 ) {
            selected_project = selected_projects[0]
        }
        const breadcrumbs = [ {to: '/projects',
                               label: 'Projects',
                               type: 'projects'}]
        if ( selected_project ) {
            breadcrumbs.push({to: '/projects/' + selected_projects[0].id,
                              label: selected_projects[0].name,
                              type: 'project',
                              selected_entities: {project: selected_project}})
        }
        dispatch(setBreadcrumbs(breadcrumbs))
    }

    onSelectProjects(project_ids) {
        const { dispatch, history } = this.props
        dispatch(selectItems(LIST_KEY__PROJECT_LIST, project_ids))
        dispatch(setPageSelectedEntities(PAGE_KEY__PROJECTS_PAGE,
                                         {project_ids:project_ids}))
        dispatch(setActivelyAvailableAutoClockEntity(project_ids && project_ids.length > 0 && project_ids[0]))
        if ( project_ids && project_ids.length === 1 ) {
            history.push('/projects/' + project_ids[0]);
        }
    }

    renderLeftPane() {
        const {project_header_list} = this.props
        
        return (
            <div className="list-layout__list">
              <ProjectList key="projects"
                           list_key={LIST_KEY__PROJECT_LIST}
                           header_list={project_header_list}
                           onSelectProjects={this.onSelectProjects} />
            </div>
        )
    }

    renderRightPane() {
        const {selected_project_ids,
               is_single_selection, is_multiple_selection, is_creating_project,
               selected_project} = this.props

        if ( is_creating_project ) {
            return (
              <div className="list-layout__sidebar">
                <NewProjectSidebar />
              </div>
            )
        }
        if ( ! is_creating_project && is_single_selection && selected_project ) {
            return (
              <div className="list-layout__sidebar">
                <ProjectSidebar project_id={selected_project.id}/>
              </div>
            )
        }
        if (! is_creating_project && is_multiple_selection && selected_project_ids ) {
            return (
              <div className="list-layout__sidebar">
                <MultipleProjectSidebar project_ids={selected_project_ids}/>
              </div>
            )
        }
        
    }
    
    render() {

        const {show_sidebar} = this.props

        if ( show_sidebar ) {
            return (
                <Splitter name='projects_page'>
                  {this.renderLeftPane()}
                  {this.renderRightPane()}
                </Splitter>
            )
        }

        if ( ! show_sidebar ) {
            return (
                <Splitter>
                  {this.renderLeftPane()}
                  {null}
                </Splitter>
            )
        }
    }
}

function mapStateToProps(state, props) {
    const {project} = state
    const items_by_id = (project && project.items_by_id) || {}
    const selected_project_ids = getPageSelectedEntities(state, PAGE_KEY__PROJECTS_PAGE).project_ids
    const default_project_id = props.match.params.projectId

    const selected_items = items_by_id && selected_project_ids && selected_project_ids.map(function (selected_id, index) {
        return items_by_id[selected_id] || {'id': selected_id,
                                            'loaded': false }
    })

    const candidate_project = getCandidateProject(state) || null
    const is_creating_project = candidate_project || false
    const project_header_list = PROJECT_HEADER_LIST
    const selected_project = ( selected_items && selected_items.length > 0 && selected_items[0] ) || null
    const show_sidebar = (is_creating_project || (selected_project && selected_project.id)) || false
    
    return {
        selected_projects: selected_items,
        selected_project_ids: selected_project_ids,
        is_single_selection: selected_items && selected_items.length === 1,
        is_multiple_selection: selected_items && selected_items.length > 1,
        is_creating_project: is_creating_project,
        default_project_id,
        project_header_list,
        selected_project,
        show_sidebar
    }
}

export default withRouter(connect(mapStateToProps)(ProjectsPage))


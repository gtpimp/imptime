import React, {Component} from 'react'
import {connect} from 'react-redux'
import {includes} from 'lodash'
import {browserHistory} from 'react-router'
import ProjectList from '../components/ProjectList'
import ProjectSidebar from '../components/ProjectSidebar'
import NewProjectSidebar from '../components/NewProjectSidebar'
import MultipleProjectSidebar from '../components/MultipleProjectSidebar'
import SplitPane from 'react-split-pane'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {
    LIST_KEY__PROJECT_LIST,
    PAGE_KEY__PROJECTS_PAGE,
    PROJECT_HEADER_LIST
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    select_projects,
    get_selected_project_ids,
    getPageFlag,
    setPageFlag
} from '../actions/Page'
import {
    initList,
    selectItems,
    update_list_filter,
    update_list_pagination,
    invalidateList
} from '../actions/ItemList'
import {getCandidateProject} from '../actions/Projects'
import { setActivelyAvailableAutoClockEntity } from '../actions/AutoClock'

class ProjectsPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectProjects = this.onSelectProjects.bind(this)
        this.onChangeSplitterSize = this.onChangeSplitterSize.bind(this)
    }

    componentDidMount() {
        const {dispatch, selected_project_ids, default_project_id} = this.props
        dispatch(set_toolbars(PAGE_KEY__PROJECTS_PAGE, ['projects']))
        dispatch(initList(LIST_KEY__PROJECT_LIST))        
        dispatch(update_list_pagination(LIST_KEY__PROJECT_LIST, {page_size:20}))
        if ( default_project_id !== undefined ) {
            dispatch(selectItems(LIST_KEY__PROJECT_LIST, [default_project_id]))
            dispatch(select_projects(PAGE_KEY__PROJECTS_PAGE, [default_project_id]))
            dispatch(setActivelyAvailableAutoClockEntity(default_project_id))
        }
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.selected_project_ids.length != this.props.selected_project_ids.length ||
             (new_props.selected_project_ids.length > 0 &&
              new_props.selected_project_ids[0] != this.props.selected_project_ids[0] )) {
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, selected_projects } = props
        let selected_project = null
        if ( selected_projects && selected_projects.length == 1 ) {
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
        const { dispatch } = this.props
        dispatch(selectItems(LIST_KEY__PROJECT_LIST, project_ids))
        dispatch(select_projects(PAGE_KEY__PROJECTS_PAGE, project_ids))
        dispatch(setActivelyAvailableAutoClockEntity(project_ids && project_ids.length > 0 && project_ids[0]))
        if ( project_ids && project_ids.length === 1 ) {
            browserHistory.push('/projects/' + project_ids[0]);
        }
    }

    onChangeSplitterSize(size) {
        const { dispatch } = this.props
        dispatch(setPageFlag(PAGE_KEY__PROJECTS_PAGE, 'splitter_size', size))
    }

    renderLeftPane() {
        const {selected_projects,
               project_header_list, selected_project} = this.props
        
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
        const {selected_projects, selected_project_ids,
               is_single_selection, is_multiple_selection, is_creating_project,
               project_header_list, selected_project} = this.props

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

        const {show_sidebar, splitter_size} = this.props

        if ( show_sidebar ) {
            return (
                <div className="list-layout">
                  <SplitPane split="vertical" minSize={50} defaultSize={"80%"}
                             defaultSize={splitter_size}
                             onChange={this.onChangeSplitterSize} >
                    <div className="left">
                      {this.renderLeftPane()}
                    </div>
                    <div className="right">
                      {this.renderRightPane()}
                    </div>
                  </SplitPane>
                </div> 
            )
        }

        if ( ! show_sidebar ) {
            return (
                <div className="list-layout__list">
                  {this.renderLeftPane()}
                </div>
            )
        }
    }
}

function mapStateToProps(state, props) {
    const {project} = state
    const items_by_id = (project && project.items_by_id) || {}
    const selected_project_ids = get_selected_project_ids(state, PAGE_KEY__PROJECTS_PAGE)
    const default_project_id = props.params.projectId

    const selected_items = items_by_id && selected_project_ids && selected_project_ids.map(function (selected_id, index) {
        return items_by_id[selected_id] || {'id': selected_id,
                                            'loaded': false }
    })

    const candidate_project = getCandidateProject(state) || null
    const is_creating_project = candidate_project || false
    const project_header_list = PROJECT_HEADER_LIST
    const selected_project = ( selected_items && selected_items.length > 0 && selected_items[0] ) || null
    const splitter_size = getPageFlag(state, PAGE_KEY__PROJECTS_PAGE, 'splitter_size', "80%")
    const show_sidebar = (is_creating_project || (selected_project && selected_project.id)) || false
    
    return {
        selected_projects: selected_items,
        selected_project_ids: selected_project_ids,
        is_single_selection: selected_items.length === 1,
        is_multiple_selection: selected_items.length > 1,
        is_creating_project: is_creating_project,
        default_project_id,
        project_header_list,
        selected_project,
        show_sidebar,
        splitter_size
    }
}

export default connect(mapStateToProps)(ProjectsPage)


import React, {Component} from 'react'
import {connect} from 'react-redux'
import {includes} from 'lodash'
import {browserHistory} from 'react-router'
import SprintList from '../components/SprintList'
import SprintSidebar from '../components/SprintSidebar'
import SprintTemplateSidebar from '../components/SprintTemplateSidebar'
import NewSprintSidebar from '../components/NewSprintSidebar'
import MultipleSprintSidebar from '../components/MultipleSprintSidebar'
import SplitPane from 'react-split-pane'
import {setSprintBreadcrumbsHelper} from '../actions/Breadcrumbs'
import {
    LIST_KEY__SPRINT_LIST,
    PAGE_KEY__SPRINTS_PAGE,
    SPRINT_HEADER_LIST
} from '../actions/ItemListKeyRegistry'
import {
    selectItems,
    update_list_filter,
    invalidateList,
    getListFilter
} from '../actions/ItemList'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {
    set_toolbars,
    select_sprints,
    select_projects,
    get_selected_sprint_ids,
    getPageFlag,
    setPageFlag
} from '../actions/Page'
import { setActivelyAvailableAutoClockEntity } from '../actions/AutoClock'
import {getCandidateSprint} from '../actions/Sprints'

class SprintsPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectSprints = this.onSelectSprints.bind(this)
        this.onChangeSplitterSize = this.onChangeSplitterSize.bind(this)
    }

    componentDidMount() {
        const {dispatch, project_id, project, list_key, page_key, default_filter} = this.props
        dispatch(set_toolbars(page_key, ['sprints']))
        dispatch(update_list_filter(list_key, Object.assign({},
                                                            default_filter,
                                                            {project_id: project.id,
                                                             sprint_status: 'open'})))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {

        const { dispatch, list_key, filter, default_filter } = this.props
        if ( new_props.project_id != filter.project_id ) {
            dispatch(update_list_filter(list_key, Object.assign({},
                                                                default_filter,
                                                                {project_id: new_props.project_id})))
        }
        
        if ( new_props.project !== this.props.project ||
             new_props.project_id != this.props.project_id ||
             new_props.project.name !== this.props.project.name ||
             new_props.selected_sprint_id != this.props.selected_sprint_id ||
             new_props.selected_sprint.id != this.props.selected_sprint.id ||
             new_props.selected_sprint.loaded != this.props.selected_sprint.loaded) {

            
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, project_id, list_key, page_key,
               default_filter, default_sprint_id, project, 
               selected_sprint_ids, selected_sprint} = props
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
        if (project && project.id) {
            dispatch(select_projects(page_key, [project.id]))
            dispatch(setActivelyAvailableAutoClockEntity(project.id,
                                                         selected_sprint_ids && selected_sprint_ids.length > 0 && selected_sprint_ids[0]))
            dispatch(invalidateList(list_key))

            dispatch(setSprintBreadcrumbsHelper(project, selected_sprint))

        }
        if ( default_sprint_id !== undefined && !includes(selected_sprint_ids, default_sprint_id) ) {
            dispatch(selectItems(LIST_KEY__SPRINT_LIST, [default_sprint_id]))
            dispatch(select_sprints(page_key, [default_sprint_id]))
            dispatch(setActivelyAvailableAutoClockEntity(project.id, default_sprint_id))
        }
    }

    onChangeSplitterSize(size) {
        const { dispatch } = this.props
        dispatch(setPageFlag(PAGE_KEY__SPRINTS_PAGE, 'splitter_size', size))
    }

    onSelectSprints(sprint_ids) {
        const {dispatch, project_id, project_name, project, list_key, page_key} = this.props
        dispatch(selectItems(list_key, sprint_ids))
        dispatch(select_sprints(page_key, sprint_ids))
        
    dispatch(setActivelyAvailableAutoClockEntity(project_id, sprint_ids && sprint_ids.length > 0 && sprint_ids[0]))
        
        if ( sprint_ids && sprint_ids.length === 1 ) {
            browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_ids[0]);
        }
    }

    renderLeftPane() {

        const {project_id, selected_sprints, selected_sprint_ids, sprint_id,
               is_single_selection, is_multiple_selection, is_creating_sprint,
               list_key, sprint_header_list, selected_sprint } = this.props
        
        return (
            <div className="list-layout__list">
              <SprintList list_key={list_key}
                          project_id={project_id}
                          header_list={sprint_header_list}
                          onSelectSprints={this.onSelectSprints}
              />
            </div>
        )
    }

    renderRightPane() {
        const { selected_sprint, project_id, is_multiple_selection,
                selected_sprint_ids, is_creating_sprint, is_single_selection } = this.props

        const is_cloneable = selected_sprint && selected_sprint.id && (selected_sprint.sprint_type === 'template' || selected_sprint.sprint_type === 'regression')
        
        if ( is_creating_sprint ) {
            return (
                <div className="list-layout__sidebar">
                  <NewSprintSidebar />
                </div>
            )
        }
        
        if ( ! is_creating_sprint && is_single_selection && project_id && selected_sprint ) {
            return (
                <div className="list-layout__sidebar">
                  { is_cloneable && 
                    <SprintTemplateSidebar sprint_id={selected_sprint.id} project_id={project_id}/>
                  }
                  { !is_cloneable &&
                    <SprintSidebar sprint_id={selected_sprint.id} project_id={project_id}/>
                  }
                </div>
            )
        }
        
        if ( ! is_creating_sprint && is_multiple_selection && project_id && selected_sprint_ids ) {
            return (
                <div className="list-layout__sidebar">
                  <MultipleSprintSidebar sprint_ids={selected_sprint_ids} project_id={project_id}/>
                </div>
            )
        }                              
    }

    render() {

        const {show_sidebar, splitter_size } = this.props

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
                <div className="list-layout">
                  {this.renderLeftPane()}
                </div>
            )
        }
    }
}

function mapStateToProps(state, props) {
    const {sprint} = state
    const default_filter = props.default_filter || {}
    let list_key = props.list_key || LIST_KEY__SPRINT_LIST
    let page_key = props.page_key || PAGE_KEY__SPRINTS_PAGE
    const items_by_id = (sprint && sprint.items_by_id) || {}
    const selected_sprint_ids = get_selected_sprint_ids(state, page_key)
    
    const selected_items = items_by_id && selected_sprint_ids && selected_sprint_ids.map(function (selected_id, index) {
        return items_by_id[selected_id] || {'id': selected_id,
                                            'loaded': false }
    })

    const project_id = props.params.projectId
    const default_sprint_id = props.params.sprintId
    const project = getProject(state, project_id) || {}
    const project_name = project.name
    const candidate_sprint = getCandidateSprint(state) || null
    const is_creating_sprint = candidate_sprint || false
    const sprint_header_list = SPRINT_HEADER_LIST
    const selected_sprint = ( selected_items && selected_items.length > 0 && selected_items[0] ) || null
    const splitter_size = getPageFlag(state, PAGE_KEY__SPRINTS_PAGE, 'splitter_size', "80%")
    const show_sidebar = (is_creating_sprint || (selected_sprint && selected_sprint.id)) || false
    const filter = getListFilter(state, list_key)

    return {
        list_key,
        page_key,
        default_filter,
        filter,
        default_sprint_id,
        project_id: project_id,
        project: project || {},
        selected_sprints: selected_items,
        selected_sprint: selected_sprint || {},
        selected_sprint_ids: selected_sprint_ids,
        is_single_selection: selected_items.length === 1,
        is_multiple_selection: selected_items.length > 1,
        is_creating_sprint: is_creating_sprint,
        sprint_header_list,
        show_sidebar,
        splitter_size,
        project,
        project_name
    }
}

export default connect(mapStateToProps)(SprintsPage)

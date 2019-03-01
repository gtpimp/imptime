import React, {Component} from 'react'
import {connect} from 'react-redux'
import {includes} from 'lodash'
import {withRouter} from 'react-router-dom'
import SprintList from '../components/SprintList'
import SprintSidebar from '../components/SprintSidebar'
import SprintTemplateSidebar from '../components/SprintTemplateSidebar'
import NewSprintSidebar from '../components/NewSprintSidebar'
import MultipleSprintSidebar from '../components/MultipleSprintSidebar'
import Splitter from '../components/Splitter'
import {setSprintBreadcrumbsHelper} from '../actions/Breadcrumbs'
import {
    LIST_KEY__SPRINT_LIST,
    PAGE_KEY__SPRINTS_PAGE
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
    setPageSelectedEntities,
    getPageSelectedEntities,
    setBrowserTitle
} from '../actions/Page'
import { setActivelyAvailableAutoClockEntity } from '../actions/AutoClock'
import {getCandidateSprint} from '../actions/Sprints'

class SprintsPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectSprints = this.onSelectSprints.bind(this)
    }

    componentDidMount() {
        const {dispatch, filter, project_id, list_key, page_key} = this.props
        dispatch(set_toolbars(page_key, ['sprints'], "Sprint list"))

        const new_filter = { project_id: project_id }
        if ( !filter.project_id || filter.project_id !== project_id ) {
            new_filter.sprint_status = 'open'
        }
        
        dispatch(update_list_filter(list_key, Object.assign({}, new_filter)))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {

        const { dispatch, list_key, filter, default_filter } = this.props
        if ( new_props.project_id !== filter.project_id ) {
            dispatch(update_list_filter(list_key, Object.assign({},
                                                                default_filter,
                                                                {project_id: new_props.project_id})))
        }
        
        if ( new_props.project !== this.props.project ||
             new_props.project_id !== this.props.project_id ||
             new_props.project.name !== this.props.project.name ||
             new_props.selected_sprint_id !== this.props.selected_sprint_id ||
             new_props.selected_sprint.id !== this.props.selected_sprint.id ||
             new_props.selected_sprint.loaded !== this.props.selected_sprint.loaded) {

            
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, project_id, list_key, page_key,
               default_sprint_id, project, 
               selected_sprint_ids, selected_sprint} = props
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
        if (project && project.id) {
            dispatch(setPageSelectedEntities(page_key, {project_ids:[project.id]}))
            dispatch(setActivelyAvailableAutoClockEntity(project.id,
                                                         selected_sprint_ids && selected_sprint_ids.length > 0 && selected_sprint_ids[0]))
            dispatch(invalidateList(list_key))

            dispatch(setSprintBreadcrumbsHelper(project, selected_sprint))

        }
        if ( default_sprint_id !== undefined && !includes(selected_sprint_ids, default_sprint_id) ) {
            dispatch(selectItems(LIST_KEY__SPRINT_LIST, [default_sprint_id]))
            dispatch(setPageSelectedEntities(page_key,
                                     {project_ids: [project_id],
                                      sprint_ids:[default_sprint_id]}))
            dispatch(setActivelyAvailableAutoClockEntity(project.id, default_sprint_id))
        }
    }

    onSelectSprints(sprint_ids) {
        const {dispatch, history, project_id,
               list_key, page_key} = this.props
        dispatch(selectItems(list_key, sprint_ids))

        dispatch(setPageSelectedEntities(page_key,
                                 {project_ids: [project_id],
                                  sprint_ids:sprint_ids}))
        
    dispatch(setActivelyAvailableAutoClockEntity(project_id, sprint_ids && sprint_ids.length > 0 && sprint_ids[0]))
        
        if ( sprint_ids && sprint_ids.length === 1 ) {
            history.push('/projects/'+project_id+'/sprints/'+sprint_ids[0]);
        }
    }

    renderLeftPane() {

        const {project_id, list_key } = this.props
        
        return (
            <div className="list-layout__list">
              <SprintList list_key={list_key}
                          project_id={project_id}
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

        const {show_sidebar, project } = this.props

        setBrowserTitle(project.name)
        
        if ( show_sidebar ) {
            return (
                <Splitter name='sprints_page'>
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
    const {sprint} = state
    const default_filter = props.default_filter || {}
    let list_key = props.list_key || LIST_KEY__SPRINT_LIST
    let page_key = props.page_key || PAGE_KEY__SPRINTS_PAGE
    const filter = getListFilter(state, list_key)
    const items_by_id = (sprint && sprint.items_by_id) || {}
    const selected_sprint_ids = getPageSelectedEntities(state, page_key).sprint_ids
    
    const selected_items = items_by_id && selected_sprint_ids && selected_sprint_ids.map(function (selected_id, index) {
        return items_by_id[selected_id] || {'id': selected_id,
                                            'loaded': false }
    })

    const project_id = props.match.params.projectId
    const default_sprint_id = props.match.params.sprintId
    const project = getProject(state, project_id) || {}
    const project_name = project.name
    const candidate_sprint = getCandidateSprint(state) || null
    const is_creating_sprint = candidate_sprint || false
    const selected_sprint = ( selected_items && selected_items.length > 0 && selected_items[0] ) || null
    const show_sidebar = (is_creating_sprint || (selected_sprint && selected_sprint.id)) || false

    return {
        list_key,
        page_key,
        default_filter,
        filter,
        default_sprint_id,
        project_id: project_id,
        project: project || {},
        selected_sprint: selected_sprint || {},
        selected_sprint_ids: selected_sprint_ids,
        is_single_selection: selected_items && selected_items.length === 1,
        is_multiple_selection: selected_items && selected_items.length > 1,
        is_creating_sprint: is_creating_sprint,
        show_sidebar,
        project_name
    }
}

export default withRouter(connect(mapStateToProps)(SprintsPage))

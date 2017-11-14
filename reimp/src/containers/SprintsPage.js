import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import SprintList from '../components/SprintList'
import SprintSidebar from '../components/SprintSidebar'
import SprintTemplateSidebar from '../components/SprintTemplateSidebar'
import NewSprintSidebar from '../components/NewSprintSidebar'
import MultipleSprintSidebar from '../components/MultipleSprintSidebar'
import {setBreadcrumbs} from '../actions/Breadcrumbs'
import {
    LIST_KEY__SPRINT_LIST,
    PAGE_KEY__SPRINTS_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    selectItems,
    update_list_filter,
    invalidateList
} from '../actions/ItemList'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {
    set_toolbars,
    select_sprints,
    select_projects,
    get_selected_sprint_ids
} from '../actions/Page'
import {getCandidateSprint} from '../actions/Sprints'

class SprintsPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectSprints = this.onSelectSprints.bind(this)
    }

    componentDidMount() {
        const {dispatch, project_id, project, list_key, page_key, default_filter} = this.props
        dispatch(set_toolbars(page_key, ['sprints']))
        dispatch(update_list_filter(list_key, Object.assign({},
                                                            default_filter,
                                                            {project_id: project.id,
                                                             sprint_type: 'sprint'})))
        dispatch(ensureProjectsLoaded([project_id]))
        this.refresh(project)
    }

    componentWillReceiveProps(new_props) {
        const {dispatch} = this.props

        dispatch(ensureProjectsLoaded([new_props.project_id]))
        if ( new_props.project.id !== this.props.project.id ||
             new_props.project.name !== this.props.project.name ) {
            this.refresh(new_props.project)
        }
    }

    refresh(project) {
        const {dispatch, list_key, page_key, default_filter} = this.props
        if (project.id) {
            dispatch(update_list_filter(list_key, Object.assign({},
                                                                default_filter,
                                                                {project_id: project.id})))
            dispatch(select_projects(page_key, [project.id]))
            dispatch(invalidateList(list_key))
            dispatch(setBreadcrumbs([{to: '/projects', label: 'Projects'},
                {to: '/projects/' + project.id, label: project.name},
                {to: '/projects/' + project.id + '/sprints', label: 'Sprints'}]))
        }
    }

    onSelectSprints(sprint_ids) {
        const {dispatch, project_id, list_key, page_key} = this.props
        dispatch(selectItems(list_key, sprint_ids))
        dispatch(select_sprints(page_key, sprint_ids))
    }

    render() {

        const {project_id, selected_sprints, selected_sprint_ids, sprint_id,
               is_single_selection, is_multiple_selection, is_creating_sprint, list_key } = this.props
        const selected_sprint = ( selected_sprints && selected_sprints.length > 0 && selected_sprints[0] ) || null

        return (
            <div className="list-layout">
                <div className="list-layout__list">
                    <SprintList list_key={list_key}
                                project_id={project_id}
                                onSelectSprints={this.onSelectSprints}
                    />
                </div>
                { is_creating_sprint &&
                  <div className="list-layout__sidebar">
                      <NewSprintSidebar />
                  </div>
                }
                  { ! is_creating_sprint && is_single_selection && project_id && selected_sprint &&
                    <div className="list-layout__sidebar">
                      { selected_sprint.sprint_type === 'template' &&
                        <SprintTemplateSidebar sprint_id={selected_sprint.id} project_id={project_id}/>
                      }
                      { selected_sprint.sprint_type !== 'template' &&
                        <SprintSidebar sprint_id={selected_sprint.id} project_id={project_id}/>
                      }
                    </div>
                  }
                { ! is_creating_sprint && is_multiple_selection && project_id && selected_sprint_ids &&
                  <div className="list-layout__sidebar">
                      <MultipleSprintSidebar sprint_ids={selected_sprint_ids} project_id={project_id}/>
                  </div>
                }                  
            </div>
        )
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
    const project = getProject(state, project_id) || {}
    const candidate_sprint = getCandidateSprint(state) || null
    const is_creating_sprint = candidate_sprint || false

    return {
        list_key,
        page_key,
        default_filter,
        project_id: project_id,
        project: project,
        selected_sprints: selected_items,
        selected_sprint_ids: selected_sprint_ids,
        is_single_selection: selected_items.length === 1,
        is_multiple_selection: selected_items.length > 1,
        is_creating_sprint: is_creating_sprint
    }
}

export default connect(mapStateToProps)(SprintsPage)

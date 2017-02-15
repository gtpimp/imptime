import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import SprintList from '../components/SprintList'
import SprintSidebar from '../components/SprintSidebar'
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
import {
    startCandidateSprint,
} from '../actions/Sprints'
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
        const {dispatch, project_id, project} = this.props
        dispatch(set_toolbars(PAGE_KEY__SPRINTS_PAGE, ['sprints']))
        dispatch(update_list_filter(LIST_KEY__SPRINT_LIST, {project_id: project.id || -1}))
        dispatch(ensureProjectsLoaded([project_id]))
        this.refresh(project)
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, project, project_id} = this.props

        dispatch(ensureProjectsLoaded([new_props.project_id]))
        if ( new_props.project.id !== this.props.project.id ||
             new_props.project.name !== this.props.project.name ) {
            this.refresh(new_props.project)
        }
    }

    refresh(project) {
        const {dispatch} = this.props
        if (project.id) {
            dispatch(update_list_filter(LIST_KEY__SPRINT_LIST, {project_id: project.id}))
            dispatch(select_projects(PAGE_KEY__SPRINTS_PAGE, [project.id]))
            dispatch(invalidateList(LIST_KEY__SPRINT_LIST))
            dispatch(setBreadcrumbs([{to: '/projects', label: 'All Projects'},
                {to: '/projects/' + project.id, label: project.name},
                {to: '/projects/' + project.id + '/sprints', label: 'All Sprints'}]))
        }
    }

    onSelectSprints(sprint_ids) {
        const {dispatch, project_id} = this.props
        if ( sprint_ids && sprint_ids.length === 1 ) {
            browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_ids[0]+'/issues');
        } else {
            dispatch(selectItems(LIST_KEY__SPRINT_LIST, sprint_ids))
            dispatch(select_sprints(PAGE_KEY__SPRINTS_PAGE, sprint_ids))
        }
    }

    render() {

        const {project_id, selected_sprints, selected_sprint_ids, sprint_id,
               is_single_selection, is_multiple_selection, is_creating_sprint } = this.props
        const selected_sprint = ( selected_sprints && selected_sprints.length > 0 && selected_sprints[0] ) || null

        return (
            <div className="list-layout">
                <div className="list-layout__list">
                    <SprintList list_key={LIST_KEY__SPRINT_LIST}
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
                      <SprintSidebar sprint_id={selected_sprint.id} project_id={project_id}/>
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
    const items_by_id = (sprint && sprint.items_by_id) || {}
    const selected_sprint_ids = get_selected_sprint_ids(state, PAGE_KEY__SPRINTS_PAGE)
    
    const selected_items = items_by_id && selected_sprint_ids && selected_sprint_ids.map(function (selected_id, index) {
        return items_by_id[selected_id] || {'id': selected_id,
                                            'loaded': false }
    })

    const project_id = props.params.projectId
    const project = getProject(state, project_id) || {}
    const candidate_sprint = getCandidateSprint(state) || null
    const is_creating_sprint = candidate_sprint || false

    return {
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

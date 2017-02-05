import React, {Component} from 'react'
import {connect} from 'react-redux'
import SprintList from '../components/SprintList'
import SprintSidebar from '../components/SprintSidebar'
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
    select_sprints
} from '../actions/Page'

class SprintsPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectSprints = this.onSelectSprints.bind(this)
    }

    componentDidMount() {
        const {dispatch, project_id, project} = this.props
        dispatch(update_list_filter(LIST_KEY__SPRINT_LIST, {project_id: project.id || -1}))
        this.refresh(project)
        dispatch(ensureProjectsLoaded([project_id]))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, project, project_id} = this.props
        if (new_props.project_id !== project_id || new_props.project.name !== project.name ) {
            this.refresh(new_props.project)
        }
        dispatch(ensureProjectsLoaded([project_id]))
    }

    onStartCandidateSprint(event) {
        const {dispatch, list_key} = this.props
        event.stopPropagation()
        dispatch(startCandidateSprint(list_key))
        alert('@Gareth')
    }

    refresh(project) {
        const {dispatch} = this.props
        if (project.id) {
            dispatch(update_list_filter(LIST_KEY__SPRINT_LIST, {project_id: project.id}))
            dispatch(invalidateList(LIST_KEY__SPRINT_LIST))
            // dispatch(expand_list(LIST_KEY__SPRINT_LIST))
            dispatch(setBreadcrumbs([{to: '/projects', label: 'All Projects'},
                {to: '/projects/' + project.id, label: project.name},
                {to: '/projects/' + project.id + '/sprints', label: 'All Sprints'}]))
            /* dispatch(setActions([
             *     {
             *         icon: 'add',
             *         onClick: this.onStartCandidateSprint
             *     }
             * ]))*/
            dispatch(set_toolbars(PAGE_KEY__SPRINTS_PAGE, ['sprints']))
        }
    }

    onSelectSprints(sprint_ids) {
        const {dispatch} = this.props
        dispatch(selectItems(LIST_KEY__SPRINT_LIST, sprint_ids))
        dispatch(select_sprints(PAGE_KEY__SPRINTS_PAGE, sprint_ids))

        /* if ( sprint_ids.length == 1 ) {
         *     browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_ids[0]);
         * }*/
    }

    render() {

        const {project_id, selected_sprints} = this.props
        const selected_sprint = ( selected_sprints && selected_sprints.length > 0 && selected_sprints[0] ) || null

        return (
            <div className="list-layout">
                <div className="list-layout__list">
                    <SprintList list_key={LIST_KEY__SPRINT_LIST}
                                project_id={project_id}
                                onSelectSprints={this.onSelectSprints}
                    />
                </div>
                { selected_sprint &&
                <div className="list-layout__sidebar">
                    <SprintSidebar sprint_id={selected_sprint.id} project_id={project_id}/>
                </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {sprint, item_list} = state
    const items_by_id = (sprint && sprint.items_by_id) || {}
    const l = (item_list && item_list[LIST_KEY__SPRINT_LIST]) || {}
    const selected_items = items_by_id && l.selected_ids && l.selected_ids.map(function (selected_id, index) {
            return items_by_id[selected_id] || {
                    'id': selected_id,
                    'loaded': false
                }
        })

    const project_id = props.params.projectId
    const project = getProject(state, project_id) || {}

    return {
        project_id: project_id,
        project: project,
        selected_sprints: selected_items
    }
}

export default connect(mapStateToProps)(SprintsPage)


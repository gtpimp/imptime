import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import ProjectList from '../components/ProjectList'
import SprintList from '../components/SprintList'
import SprintSidebar from '../components/SprintSidebar'
import {StickyContainer} from 'react-sticky';
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {
    LIST_KEY__PROJECT_LIST,
    LIST_KEY__SPRINT_LIST,
    LIST_KEY__ISSUE_LIST,
    LIST_KEY__ISSUE_DEVELOPER_DETAILS
} from '../actions/ItemListKeyRegistry'
import {
    expand_list,
    selectItems,
    update_list_filter,
    invalidateList
} from '../actions/ItemList'

class SprintsPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectSprints = this.onSelectSprints.bind(this)
    }

    componentDidMount() {
        const {dispatch, project_id} = this.props
        this.refresh(project_id)
    }

    componentWillReceiveProps(new_props) {
        const { project_id } = this.props
        if ( new_props.project_id != project_id ) {
            this.refresh(new_props.project_id)
        }
    }

    refresh(project_id) {
        const {dispatch} = this.props
        if ( project_id ) {
            dispatch(update_list_filter(LIST_KEY__SPRINT_LIST, {project_id:project_id}))
            dispatch(invalidateList(LIST_KEY__SPRINT_LIST))
            dispatch(expand_list(LIST_KEY__SPRINT_LIST))
            dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'},
                                      {to: '/projects/'+project_id, label: project_id},
                                      {to: '/projects/'+project_id+'/sprints', label: 'All Sprints'} ]) )
        }
    }
    
    onSelectSprints(sprint_ids) {
        const { dispatch, project_id } = this.props
        dispatch(selectItems(LIST_KEY__SPRINT_LIST, sprint_ids))

        /* if ( sprint_ids.length == 1 ) {
         *     browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_ids[0]);
         * }*/
    }
    
    render() {

        const { project_id, selected_sprints } = this.props
        const selected_sprint = ( selected_sprints && selected_sprints.length > 0 && selected_sprints[0] ) || null
        
        return (
            <div>
                <StickyContainer>
                    { selected_sprint && 
                      <SprintSidebar sprint_id={selected_sprint.id} project_id={project_id}/>
                    }
                    <SprintList list_key={LIST_KEY__SPRINT_LIST}
                                project_id={project_id}
                                onSelectSprints={this.onSelectSprints}
                    />
                </StickyContainer>
                
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {sprint, item_list} = state
    const items_by_id = sprint && sprint.items_by_id || {}
    const l = (item_list && item_list[LIST_KEY__SPRINT_LIST]) || {}
    const selected_items = items_by_id && l.selected_ids && l.selected_ids.map( function(selected_id, index) {
	return items_by_id[selected_id] || { 'id': selected_id,
					     'loaded': false }
    })

    const project_id = props.params.projectId

    return {
        project_id: project_id,
        selected_sprints: selected_items
    }
}

export default connect(mapStateToProps)(SprintsPage)


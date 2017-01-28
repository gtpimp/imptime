import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import ProjectList from '../components/ProjectList'
import ProjectSidebar from '../components/ProjectSidebar'
import {browserHistory} from 'react-router'
import {StickyContainer} from 'react-sticky';
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {
    LIST_KEY__PROJECT_LIST,
    LIST_KEY__SPRINT_LIST,
    LIST_KEY__ISSUE_LIST,
    LIST_KEY__ISSUE_DEVELOPER_DETAILS
} from '../actions/ItemListKeyRegistry'
import {
    initList,
    invalidateList,
    selectItems,
    collapse_list,
    expand_list
} from '../actions/ItemList'

class ProjectsPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectProjects = this.onSelectProjects.bind(this)
    }

    componentDidMount() {
        const {dispatch} = this.props
        dispatch(expand_list(LIST_KEY__PROJECT_LIST))
        dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'} ]))
    }

    onSelectProjects(project_ids) {
        const { dispatch } = this.props
        dispatch(selectItems(LIST_KEY__PROJECT_LIST, project_ids))

        /* if ( project_ids.length == 1 ) {
         *     browserHistory.push('/projects/'+project_ids[0]);
         * }*/
    }

    render() {
 
        const { selected_projects } = this.props
        const selected_project = ( selected_projects && selected_projects.length > 0 && selected_projects[0] ) || null
        
        return (
            <div>
                <StickyContainer>
                    { selected_project && 
                      <ProjectSidebar project_id={selected_project.id}/>
                    }
                    <ProjectList key="projects"
                                 list_key={LIST_KEY__PROJECT_LIST}
                                 onSelectProjects={this.onSelectProjects}
                    />
                </StickyContainer>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const {project, item_list} = state
    const items_by_id = project && project.items_by_id || {}
    const l = (item_list && item_list[LIST_KEY__PROJECT_LIST]) || {}

    const selected_items = items_by_id && l.selected_ids && l.selected_ids.map( function(selected_id, index) {
	return items_by_id[selected_id] || { 'id': selected_id,
					     'loaded': false }
    })

    return {
        selected_projects: selected_items
    }
}

export default connect(mapStateToProps)(ProjectsPage)


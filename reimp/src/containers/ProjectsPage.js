import React, {Component} from 'react'
import {connect} from 'react-redux'
import ProjectList from '../components/ProjectList'
import ProjectSidebar from '../components/ProjectSidebar'
import {StickyContainer} from 'react-sticky';
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {
    LIST_KEY__PROJECT_LIST,
    PAGE_KEY__PROJECTS_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    selectItems,
    expand_list
} from '../actions/ItemList'
import {
    set_toolbars,
    select_projects
} from '../actions/Page'

class ProjectsPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectProjects = this.onSelectProjects.bind(this)
    }

    componentDidMount() {
        const {dispatch} = this.props
        dispatch(expand_list(LIST_KEY__PROJECT_LIST))
        dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'} ]))
        dispatch(set_toolbars(PAGE_KEY__PROJECTS_PAGE, ['projects']))
    }

    onSelectProjects(project_ids) {
        const { dispatch } = this.props
        dispatch(selectItems(LIST_KEY__PROJECT_LIST, project_ids))
        dispatch(select_projects(PAGE_KEY__PROJECTS_PAGE, project_ids))

        /* if ( project_ids.length == 1 ) {
         *     browserHistory.push('/projects/'+project_ids[0]);
         * }*/
    }
            
    render() {
 
        const { selected_project_id } = this.props
        
        return (
            <div className="list-layout">
                <div className="list-layout__list">
                    <ProjectList key="projects"
                                 list_key={LIST_KEY__PROJECT_LIST}
                                 onSelectProjects={this.onSelectProjects} />
                </div>
                { selected_project_id &&
                <div className="list-layout__sidebar">
                    <ProjectSidebar project_id={selected_project_id}/>
                </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state) {
    const {project, page} = state
    const selected_project_ids = (page[PAGE_KEY__PROJECTS_PAGE] ||{}).project_ids || []
    const selected_project_id = (selected_project_ids && selected_project_ids.length > 0 && selected_project_ids[0]) || null
    
    return {
        selected_project_ids: selected_project_ids,
        selected_project_id: selected_project_id,
    }
}

export default connect(mapStateToProps)(ProjectsPage)


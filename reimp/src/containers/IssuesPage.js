import React, {Component} from 'react'
import {connect} from 'react-redux'
import IssueSidebar from '../components/IssueSidebar'
import IssueList from '../components/IssueList'
import {StickyContainer} from 'react-sticky'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {
    LIST_KEY__ISSUE_LIST,
} from '../actions/ItemListKeyRegistry'
import {
    expand_list,
    update_list_filter,
    invalidateList
} from '../actions/ItemList'

class IssuesPage extends Component {

    componentDidMount() {
        const {sprint_id, project_id} = this.props
        this.refresh(sprint_id, project_id)
    }

    componentWillReceiveProps(new_props) {
        const { sprint_id } = this.props
        if ( new_props.sprint_id !== sprint_id ) {
            this.refresh(new_props.sprint_id, new_props.project_id)
        }
    }

    refresh(sprint_id, project_id) {
        const {dispatch} = this.props
        if ( sprint_id ) {
            dispatch(update_list_filter(LIST_KEY__ISSUE_LIST, {sprint_id:sprint_id}))
            dispatch(invalidateList(LIST_KEY__ISSUE_LIST))
            dispatch(expand_list(LIST_KEY__ISSUE_LIST))
            dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'},
                                      {to: '/projects/'+project_id, label: project_id},
                                      {to: '/projects/'+project_id+'/sprints', label: 'All Sprints'},
                                      {to: '/projects/'+project_id+'/sprints/'+sprint_id, label: sprint_id},
                                      {to: '/projects/'+project_id+'/sprints/'+sprint_id+'/issues', label: 'All Issues'}]))
        }
    }

    render() {

        const { sprint_id, project_id, selected_issues } = this.props

        const selected_issue = ( selected_issues && selected_issues.length > 0 && selected_issues[0] ) || null
        
        return (
            <div>
                <StickyContainer>
                    { selected_issue && 
                      <IssueSidebar issue_id={selected_issue.id} sprint_id={sprint_id} project_id={project_id}/>
                    }
                    { sprint_id &&
                      <IssueList list_key={LIST_KEY__ISSUE_LIST} />
                    }
                </StickyContainer>
                
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {issue, item_list} = state
    const items_by_id = (issue && issue.items_by_id) || {}
    const l = (item_list && item_list[LIST_KEY__ISSUE_LIST]) || {}
    const selected_items = items_by_id && l.selected_ids && l.selected_ids.map( function(selected_id, index) {
	return items_by_id[selected_id] || { 'id': selected_id,
					     'loaded': false }
    })

    const sprint_id = props.params.sprintId
    const project_id = props.params.projectId
    
    return {
        sprint_id: sprint_id,
        project_id: project_id,
        selected_issues: selected_items
    }
}

export default connect(mapStateToProps)(IssuesPage)

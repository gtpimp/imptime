import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import ProjectList from '../components/ProjectList'
import SprintList from '../components/SprintList'
import IssueList from '../components/IssueList'
import IssueDetails from '../components/IssueDetails'
import IssueDeveloperDetails from '../components/IssueDeveloperDetails'
import {StickyContainer} from 'react-sticky';
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
        this.refreshList(project_id)
    }

    componentWillReceiveProps(new_props) {
        this.refreshList(new_props.project_id)
    }

    refreshList(project_id) {
        const {dispatch} = this.props
        if ( project_id ) {
            dispatch(update_list_filter(LIST_KEY__SPRINT_LIST, {project_id:project_id}))
            dispatch(invalidateList(LIST_KEY__SPRINT_LIST))
            dispatch(expand_list(LIST_KEY__SPRINT_LIST))
        }
    }
    
    onSelectSprints(sprint_ids) {
        const { dispatch, project_id } = this.props
        dispatch(selectItems(LIST_KEY__SPRINT_LIST, sprint_ids))

        if ( sprint_ids.length == 1 ) {
            browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_ids[0]);
        }
    }
    
    render() {

        const { project_id } = this.props
        
        return (
            <div>
                <StickyContainer>
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
    const {} = state

    const project_id = props.params.projectId

    return {
        project_id: project_id
    }
}

export default connect(mapStateToProps)(SprintsPage)


import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
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
    update_list_filter,
    invalidateList,
    fetchIssuesIfNeeded
} from '../actions/ItemList'

class IssuesPage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {dispatch, sprint_id} = this.props
        this.refreshList(sprint_id)
    }

    componentWillReceiveProps(new_props) {
        this.refreshList(new_props.sprint_id)
    }

    refreshList(sprint_id) {
        const {dispatch} = this.props
        if ( sprint_id ) {
            dispatch(update_list_filter(LIST_KEY__ISSUE_LIST, {sprint_id:sprint_id}))
            dispatch(invalidateList(LIST_KEY__ISSUE_LIST))
            dispatch(expand_list(LIST_KEY__ISSUE_LIST))
        }
    }

    render() {

        const { sprint_id } = this.props

        return (
            <div>
                Sprint {sprint_id}
                <StickyContainer>
                    { sprint_id &&
                      <IssueList list_key={LIST_KEY__ISSUE_LIST} />
                    }
                </StickyContainer>
                
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {} = state

    const sprint_id = props.params.sprintId
    
    return {
        sprint_id: sprint_id
    }
}

export default connect(mapStateToProps)(IssuesPage)

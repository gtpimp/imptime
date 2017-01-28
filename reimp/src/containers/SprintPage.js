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
    expand_list
} from '../actions/ItemList'

class SprintPage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {dispatch} = this.props
        dispatch(expand_list(LIST_KEY__SPRINT_LIST))
    }

    render() {

        const { sprint_id } = this.props
        
        return (
            <div>
                <StickyContainer>
                    <IssueList list_key={LIST_KEY__ISSUE_LIST}
                               sprint_id={sprint_id}
                    />
                </StickyContainer>
                
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {} = state

    const { sprint_id } = props.params.sprintId
    
    return {
        sprint_id: sprint_id
    }
}

export default connect(mapStateToProps)(SprintPage)


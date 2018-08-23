import React, {Component} from 'react'
import IssueSelectorForm from './form/IssueSelectorForm'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'

class QuickIssueCreator extends Component {

    constructor(props) {
        super(props)
        this.onIssueCreated = this.onIssueCreated.bind(this)
    }

    onIssueCreated(new_issue) {
        const { history } = this.props
        const { issue_id, sprint_id, project_id } = new_issue
        history.push('/projects/'+project_id+'/sprints/'+sprint_id+'/issues/'+issue_id)
    }
    
    render() {
        return (
            <IssueSelectorForm onSubmitted={this.onIssueCreated}
                               initial_mode="create" />
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}

export default withRouter(connect(mapStateToProps)(QuickIssueCreator))



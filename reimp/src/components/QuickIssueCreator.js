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



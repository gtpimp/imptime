import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/sprint-label.css'

class IssueStatusLabel extends Component {

    render() {
        const { status_name } = this.props
        return (
            <div className="issue-status-label">
                {status_name}
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { value } = props
    const status_name = value
    
    return {
        status_name: status_name
    }
}

export default connect(mapStateToProps)(IssueStatusLabel)


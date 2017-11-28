import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/sprint-label.css'

class IssueTypeLabel extends Component {

    render() {
        const { type_name } = this.props
        return (
            <div className="issue-type-label">
                {type_name}
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { value } = props
    const type_name = value
    
    return {
        type_name: type_name
    }
}

export default connect(mapStateToProps)(IssueTypeLabel)


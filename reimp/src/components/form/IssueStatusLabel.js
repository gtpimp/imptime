import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { impfetch } from '../../actions/lib'

class IssueStatusLabel extends Component {

    render() {
        const { status_name } = this.props
        return (
            <div>
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


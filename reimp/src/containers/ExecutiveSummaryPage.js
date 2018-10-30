import React, {Component} from 'react'
import Websocket from '../components/Websocket'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import ReadOnlyIssueComment from '../components/readonly/ReadOnlyIssueComment'
import ReadOnlyHeader from '../components/readonly/ReadOnlyHeader'
import ReadOnlyExecutiveSummary from '../components/readonly/ReadOnlyExecutiveSummary'

class ExecutiveSummaryPage extends Component {
    
    render() {
        const { obj_ref } = this.props
        
        return (
            <ReadOnlyExecutiveSummary obj_ref={obj_ref} />
        )
    }
}

function mapStateToProps(state, props) {
    const obj_ref = props.match.params.obj_ref
    console.log("obj_ref", obj_ref)
    return {
        obj_ref
    }
}

export default withRouter(connect(mapStateToProps)(ExecutiveSummaryPage))


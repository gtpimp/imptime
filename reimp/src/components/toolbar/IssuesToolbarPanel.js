import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar-panel.css'

class IssuesToolbarPanel extends Component {

    onNewIssueClick() {
        console.log('new issue clicked')
    }

    render() {
        return (
            <div className="toolbar-panel">
                <div className="button button--large button--primary" onClick={this.onNewIssueClick}>+ New Issue</div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(IssuesToolbarPanel)

import React, {Component} from 'react'
import {connect} from 'react-redux'

class  DeleteIssue extends Component {

    render() {

        const { onDelete } = this.props
        return (
            <div className="timer-switch">
              <button className="button button--default button--timer button--start-timer" onClick={onDelete}>
               <div className="button__text">
                 Delete Issue
               </div>
             </button>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return{}
}
export default connect(mapStateToProps)(DeleteIssue)

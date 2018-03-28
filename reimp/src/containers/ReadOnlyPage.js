import React, {Component} from 'react'
import Websocket from '../components/Websocket'
import {connect} from 'react-redux'
import {
    selectItems,
    invalidateList
} from '../actions/ItemList'
import ReadOnlyIssueComment from '../components/readonly/ReadOnlyIssueComment'
import ReadOnlyHeader from '../components/readonly/ReadOnlyHeader'

class ReadOnlyPage extends Component {
    
    render() {
        const { object_type, obj_ref, subref } = this.props
        
        return (
            <div className="sharing-page">
              <Websocket/>
              <ReadOnlyHeader/>
              <div className="sharing-page-content">
                { object_type === 'issue_comment' &&
                  <ReadOnlyIssueComment obj_ref={obj_ref} subref={subref} />
                }
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const object_type = props.params.type
    const obj_ref = props.params.obj_ref
    const subref = props.params.subref
    
    return {
        object_type,
        obj_ref,
        subref
    }
}

export default connect(mapStateToProps)(ReadOnlyPage)


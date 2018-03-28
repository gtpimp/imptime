import React, {Component} from 'react'
import {connect} from 'react-redux'
import {
    selectItems,
    invalidateList
} from '../actions/ItemList'
import ReadOnlyIssueComment from '../components/readonly/ReadOnlyIssueComment'

class ReadOnlyPage extends Component {
    
    render() {
        const { object_type, obj_ref, subref } = this.props
        
        return (
            <div className="read-only-page">
              { object_type === 'issue_comment' &&
                <ReadOnlyIssueComment obj_ref={obj_ref} subref={subref} />
              }
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


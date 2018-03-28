import React, {Component} from 'react'
import {connect} from 'react-redux'
import {
    selectItems,
    invalidateList
} from '../actions/ItemList'
import { ReadOnlyIssueComment } from '../components/readonly/ReadOnlyIssueComment'

class ReadOnlyPage extends Component {
    
    componentDidMount() {
        const {dispatch, object_ref, ref} = this.props
    }
            
    render() {
        const { object_type, ref, subref } = this.props
        
        return (
            <div className="read-only-page">
              { object_type === 'issue_comment' &&
                <ReadOnlyIssueComment ref={ref} subref={subref} />
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const object_type = props.params.type
    const ref = props.params.ref
    const subref = props.params.subref
    
    return {
        object_type,
        ref,
        subref
    }
}

export default connect(mapStateToProps)(ReadOnlyPage)


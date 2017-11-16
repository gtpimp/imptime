import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {
    LIST_KEY__NUDGE_LIST,
} from '../actions/ItemListKeyRegistry'
import {
    selectItems,
    invalidateList
} from '../actions/ItemList'
import NudgeList from '../components/NudgeList'

class NudgePage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {dispatch} = this.props
    }
            
    render() {
        return (
            <div className="list-layout">
              <NudgeList list_key={LIST_KEY__NUDGE_LIST}/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    return {
    }
}

export default connect(mapStateToProps)(NudgePage)


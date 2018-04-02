import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {
    LIST_KEY__NUDGE_LIST,
    PAGE_KEY__NUDGE_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    selectItems,
    invalidateList
} from '../actions/ItemList'
import {
    set_toolbars,
} from '../actions/Page'
import NudgeList from '../components/NudgeList'

class NudgePage extends Component {

    componentDidMount() {
        const {dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__NUDGE_PAGE, ['nudge']))
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

export default connect(mapStateToProps)(withRouter(NudgePage))


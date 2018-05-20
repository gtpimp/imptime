import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {
    LIST_KEY__SCHEDULE_LIST,
    PAGE_KEY__SCHEDULE_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
} from '../actions/Page'
import ScheduleList from '../components/ScheduleList'

class SchedulePage extends Component {

    componentDidMount() {
        const {dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__SCHEDULE_PAGE, ['schedule']))
    }
            
    render() {
        return (
            <div className="list-layout">
              <ScheduleList list_key={LIST_KEY__SCHEDULE_LIST}/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    return {
    }
}

export default withRouter(connect(mapStateToProps)(SchedulePage))


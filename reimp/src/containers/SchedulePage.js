import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {
    LIST_KEY__SCHEDULE_LIST,
    PAGE_KEY__SCHEDULE_PAGE,
    SCHEDULE_HEADER_LIST
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
        const { schedule_header_list } = this.props
        
        return (
            <div className="list-layout">
              <ScheduleList list_key={LIST_KEY__SCHEDULE_LIST}
                            header_list={schedule_header_list}
              />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const schedule_header_list = SCHEDULE_HEADER_LIST
    
    return {
        schedule_header_list
    }
}

export default withRouter(connect(mapStateToProps)(SchedulePage))


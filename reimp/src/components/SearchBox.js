import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/search-box.css'
import RIEModeToggler from '../widgets/RIEModeToggler'
import RIEInput from '../widgets/RIEInput'
import {updateGlobalFilter} from '../actions/Filter'


class SearchBox extends Component {

    constructor(props) {
        super(props)
        this.onFilter = this.onFilter.bind(this)
    }

    onFilter(value) {
        const {dispatch} = this.props
        dispatch(updateGlobalFilter(value))
    }

    render() {

        const {global_filter} = this.props

        return (
            <div className="search-box">
                <div className="search-box__component search-box__icon"><i className="material-icons">search</i></div>
                <div className="search-box__component search-box__component--textfield">
                    <RIEModeToggler
                        rie_key="filter_box"
                        initialValue={global_filter}
                        onChange={this.onFilter}
                    >
                        <RIEInput className="search-box__textfield" placeholder="Search ImpTime" />
                        <div className="header_bar__filter_box__current_value">
                            {global_filter}
                        </div>
                    </RIEModeToggler>
                </div>
                <div className="search-box__component search-box__icon"><i className="material-icons">arrow_drop_down</i></div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {filter} = state
    const global_filter = (filter && filter.global_filter) || null

    return {
        global_filter: global_filter
    }
}

export default connect(mapStateToProps)(SearchBox)

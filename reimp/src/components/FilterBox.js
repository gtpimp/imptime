import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import RIEModeToggler from '../widgets/RIEModeToggler'
import RIEInput from '../widgets/RIEInput'
import { updateGlobalFilter, clearGlobalFilter } from '../actions/Filter'

class FilterBox extends Component {

    constructor(props) {
	super(props)
	this.onFilter = this.onFilter.bind(this)
    }

    onFilter(value) {
	const { dispatch } = this.props
	dispatch(updateGlobalFilter(value))
    }

    render() {

        const { global_filter } = this.props

        return (
	    <div className="header_bar__filter_box">

		<RIEModeToggler
		    rie_key="filter_box"
		    initialValue={global_filter}
		    onChange={this.onFilter}
		>
		    <RIEInput />
		    <div className="header_bar__filter_box__current_value">
			{global_filter}
			<div className="header_bar__filter_box__search_icon">&nbsp;</div>
		    </div>
		</RIEModeToggler>
	    </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { filter } = state
    const global_filter = (filter && filter.global_filter) || null
    
    return {
	global_filter: global_filter
    }
}

export default connect(mapStateToProps)(FilterBox)

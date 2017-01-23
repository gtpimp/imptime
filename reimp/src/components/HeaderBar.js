import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import NotificationBar from '../components/NotificationBar'
import FilterBox from '../components/FilterBox'

class HeaderBar extends Component {

    render() {

        const {} = this.props

        return (
	    <div className="header_bar">
		<div className="header_bar__inner">
		    <div className="header_bar__logo">
			<a href="http://imptime.impd.co.za">ImpTime</a>
		    </div>
		    <FilterBox />
		    <NotificationBar />
		</div>
	    </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
    }
}

export default connect(mapStateToProps)(HeaderBar)

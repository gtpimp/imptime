import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import NotificationBar from '../components/NotificationBar'
import FilterBox from '../components/FilterBox'
import { logged_in_user } from '../actions/Auth'

class HeaderBar extends Component {

    render() {

        const {username} = this.props

        return (
	    <div className="header_bar">
		<div className="header_bar__inner">
		    <div className="header_bar__logo">
			<a href="http://imptime.impd.co.za">ImpTime</a>
                        {username}
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
        username: logged_in_user(state).username
    }
}

export default connect(mapStateToProps)(HeaderBar)

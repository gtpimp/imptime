import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import NotificationBar from '../components/NotificationBar'


export class HeaderBar extends Component {

    render() {

        const {} = this.props

        return (
	    <div className="header_bar">
		<div className="header_bar__inner">
		    <div className="header_bar__logo">
			<a href="http://www.implicitdesign.co.za">ImpTime</a>
		    </div>
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

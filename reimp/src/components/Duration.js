import React, { Component } from 'react'
import { connect } from 'react-redux'

class Duration extends Component {

    render() {
    	const { value } = this.props
    	return (
    		<div className="duration">{value}</div>
		)
    }
}

function mapStateToProps(state, props) {
	return {

	}
}


export default connect(mapStateToProps)(Duration)
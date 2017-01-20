import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'

class Duration extends Component {

    constructor(props) {
        super(props)
    }


    render() {
    	const { value } = this.props
    	return (
    		<div className="duration">{value} </div>
		)
    }
}

function mapStateToProps(state, props) {
	return {

	}
}


export default connect(mapStateToProps)(Duration)

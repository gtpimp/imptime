import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'

class Attachments extends Component {

    constructor(props) {
        super(props)
    }

    render() {
    	return (
    		<div className="attachments">
				<div className="attachments__preview">
asdf
				</div>
			</div>
		)
    }
}

function mapStateToProps(state, props) {
	return {

	}
}


export default connect(mapStateToProps)(Attachments)

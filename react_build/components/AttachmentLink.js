import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'

class AttachmentLink extends Component {

    constructor(props) {
        super(props)
    }

    render() {
    	const { attachment } = this.props
    	return (
    		<div className="attachment-link">
				<a href="" className="attachment-link__link">{attachment.label}</a>
			</div>
		)
    }
}

function mapStateToProps(state, props) {
	return {

	}
}


export default connect(mapStateToProps)(AttachmentLink)

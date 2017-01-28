import React, { Component } from 'react'
import { connect } from 'react-redux'

class AttachmentLink extends Component {

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

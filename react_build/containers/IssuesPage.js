import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class IssuesPage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const { dispatch } = this.props
    }

    render() {

        const {} = this.props

        return (
            <div>
		Some issues on a page
	    </div>
        )
    }
}

function mapStateToProps(state) {
    const {} = state

    return {
    }
}

export default connect(mapStateToProps)(IssuesPage)


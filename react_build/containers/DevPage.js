import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ProjectList from '../components/ProjectList'

class DevPage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const { dispatch } = this.props
    }

    render() {

        return (
            <div>
		<ProjectList key="projects" list_key="projects" />
	    </div>
        )
    }
}

function mapStateToProps(state) {
    const {} = state

    return {
    }
}

export default connect(mapStateToProps)(DevPage)


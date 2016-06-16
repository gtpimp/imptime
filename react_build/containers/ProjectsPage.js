import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ProjectTable from '../components/ProjectTable'

class ProjectsPage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const { dispatch } = this.props
    }

    render() {

        return (
            <div>
		<ProjectTable key="projects" list_key="projects" />
	    </div>
        )
    }
}

function mapStateToProps(state) {
    const {} = state

    return {
    }
}

export default connect(mapStateToProps)(ProjectsPage)


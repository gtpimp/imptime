import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ProjectList from '../components/ProjectList'
import SprintList from '../components/SprintList'

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
		<SprintList key="sprints" list_key="sprints" />
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


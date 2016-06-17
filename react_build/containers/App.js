import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ProjectsPage from './ProjectsPage'
import NotificationBar from '../components/NotificationBar'

class App extends Component {

    componentDidMount() {
        const { dispatch } = this.props

        window.onerror = function(msg, url, line, col, error) {
	    //alert("whoops")
        }
    }

    render() {
        const {} = this.props

        return (
            <div className="app">

		<NotificationBar/>
		
		<ProjectsPage/>
	    </div>
        )
    }
}

function mapStateToProps(state) {
    const {} = state

    return {
    }
}

export default connect(mapStateToProps)(App)

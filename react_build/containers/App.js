import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { DragDropContext } from 'react-dnd';
var HTML5Backend = require('react-dnd-html5-backend');
import DevPage from './DevPage'
import HeaderBar from '../components/HeaderBar'

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

		<HeaderBar/>
		
		<DevPage/>
	    </div>
        )
    }
}

function mapStateToProps(state) {
    const {} = state

    return {
    }
}

export default connect(mapStateToProps)(DragDropContext(HTML5Backend)(App))


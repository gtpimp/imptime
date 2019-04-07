import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import SimplifiedTitle from '../components/SimplifiedTitle'
import SimplifiedProjectList from '../components/SimplifiedProjectList'
import SimplifiedPage from './SimplifiedPage'

class SimplifiedProjectsPage extends Component {

    render() {
        return (
            <SimplifiedPage>
              <SimplifiedTitle>Projects</SimplifiedTitle>
              <SimplifiedProjectList />
            </SimplifiedPage>
        )
    }
}
function mapStateToProps(state, props) {
}

export default withRouter(connect(mapStateToProps)(SimplifiedProjectsPage))

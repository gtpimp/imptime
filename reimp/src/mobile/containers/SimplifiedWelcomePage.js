import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { isMobile } from '../../actions/Settings'
import SimplifiedPage from './SimplifiedPage'

class SimplifiedWelcomePage extends Component {

    onShowProjects = (evt) => {
        const { history } = this.props
        evt.preventDefault()
        history.push('/wd/projects')
    }
    
    render() {
        return (
            <SimplifiedPage>
              Welcome to mobile mode
              <button onClick={this.onShowProjects}>
                Projects
              </button>
            </SimplifiedPage>
        )
    }
}

function mapStateToProps(state, props) {
    return {
        is_mobile: isMobile()
    }
}

export default withRouter(connect(mapStateToProps)(SimplifiedWelcomePage))

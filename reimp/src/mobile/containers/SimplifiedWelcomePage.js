import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { isMobile } from '../../actions/Settings'
import SimplifiedPage from './SimplifiedPage'
import SimplifiedButton from '../components/SimplifiedButton'

class SimplifiedWelcomePage extends Component {

    onShowProjects = (evt) => {
        const { history } = this.props
        evt.preventDefault()
        history.push('/wd/projects')
    }
    
    render() {
        return (
            <SimplifiedPage title="ImpTime">
              <SimplifiedButton onClick={this.onShowProjects}>
                Projects
              </SimplifiedButton>
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

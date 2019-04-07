import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { isMobile } from '../../actions/Settings'

class SimplifiedWelcomePage extends Component {

    componentDidMount() {
        const { is_mobile, history } = this.props
        if ( !is_mobile ) {
            history.push('/')
        }
    }
    
    render() {
        return (
            <div>
              Welcome to mobile mode
            </div>
        )
    }
}
function mapStateToProps(state, props) {
    return {
        is_mobile: isMobile()
    }
}

export default withRouter(connect(mapStateToProps)(SimplifiedWelcomePage))

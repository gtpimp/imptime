import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'

class WelcomePage extends Component {

    render() {
        return (

            <div className="welcome-page">
              <div className="welcome-page-content">
                Welcome to ImpTime.
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {
    }
}

export default withRouter(connect(mapStateToProps)(WelcomePage))


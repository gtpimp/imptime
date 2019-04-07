import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'
import { isMobile } from '../../actions/Settings'

class SimplifiedPage extends Component {

    componentDidMount() {
        const { history } = this.props
        if ( !isMobile() ) {
            history.push('/')
        }
    }
    
    render() {
        return (
            <div>
              {this.props.children}
            </div>
        )
    }
}

export default withRouter(SimplifiedPage)

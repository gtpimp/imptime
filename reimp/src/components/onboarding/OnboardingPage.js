import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import {withRouter} from 'react-router-dom'
import { default_theme as theme } from '../../theme/default'

class OnboardingPage extends Component {

    render() {
        const { children } = this.props
        return (
            <div className={ main }>
              { children }
            </div>
        )
    }
}
function mapStateToProps(state, props) {
    return {
    }
}
export default withRouter(connect(mapStateToProps)(OnboardingPage))

const main = css`
display: flex;
justify-content: center;
padding-top: 50px;

@media (max-width: ${theme.breakpoints.mobile}) {
    padding-top: 0;
    justify-content: flex-start;
}
`

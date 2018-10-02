import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'

import { css } from 'emotion'
import { default_theme as theme } from '../../theme/default'

const main = css`
display: flex;
flex: 1;
min-height: 100vh;
background-color: ${theme.colours.white};
`

class ExecutiveSummaryPage extends Component {
    
    render() {

        return (
            <div className={ main } id="app">
              <p>Executive Summary Page</p>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {}
}

export default withRouter(connect(mapStateToProps)(ExecutiveSummaryPage))

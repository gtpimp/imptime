import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../../theme/default'
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
            <div className={box}>
              {this.props.children}
            </div>
        )
    }
}

export default withRouter(SimplifiedPage)

const box = css`
background-color: ${theme.colours.white};
margin-top: 50px;
width: 100%;
height: 100%;
box-shadow: none;
border-radius: 0;
border: none;
position: absolute;
left: 0;
top: 0;
margin-top: 0;
padding: ${theme.spacing.horizontal_space_inline};
`

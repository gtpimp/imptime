import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../../theme/default'
import {withRouter} from 'react-router-dom'
import { isMobile } from '../../actions/Settings'
import SimplifiedTitle from '../components/SimplifiedTitle'

class SimplifiedPage extends Component {

    componentDidMount() {
        const { history } = this.props
        if ( !isMobile() ) {
            history.push('/')
        }
    }

    onBack = (evt) => {
        const { history } = this.props
        evt.preventDefault()
        history.goBack()
    }
    
    onHome = (evt) => {
        const { history } = this.props
        evt.preventDefault()
        history.push('/wd/')
    }
    
    render() {
        const { title } = this.props
        
        return (
          <div>
            <div className={box}>
              <div className={header}>
                <button onClick={ this.onBack }>
                  <i className="material-icons">chevron_left</i>
                </button>
                <button onClick={ this.onHome }>
                  <i className="material-icons">home</i>
                </button>
                <div className={header_title}>
                  <SimplifiedTitle>
                    { title }
                  </SimplifiedTitle>
                </div>
              </div>
              {this.props.children}
            </div>
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
overflow: auto
`

const header = css`
margin-bottom: ${theme.spacing.vertical_section_gap};
border-bottom: ${theme.colours.border_strong};
display: flex;
`

const header_title = css`
margin-left: ${theme.spacing.one};
`

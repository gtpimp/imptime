import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'

import { css, cx } from 'emotion'
import { default_theme as theme } from '../../theme/default'

const main = css`
display: flex;
flex: 1;
flex-direction: column;
min-height: 100vh;
background-color: ${theme.colours.page_background};
align-items: center;
`

const box = css`
display: flex;
width: 560px;
background-color: ${theme.colours.white};
margin-top: 50px;
box-shadow: ${theme.box_shadows.main};
`

const summary_header = css`
padding: 24px;
`

const card_title = css`
font: ${theme.fonts.semibold_massive};
`

const circle = css`
width: 21px; 
height: 21px; 
border-radius: 50%;
margin-right: 5px;
background-color: ${theme.colours.red}
`

const title_row = css`
display: flex;
flex: 1;
align-items: center;
justify-content: flex-start;
`

const status_row = css`
display: flex;
flex: 1;
align-items: center;
justify-content: flex-start;
`

const status_text = css`
font: ${theme.fonts.regular_huge};
`

const red_text = css`
color: ${theme.colours.red}
`

const spacer = css`
color: ${theme.colours.button_background};
padding: 0 10px 0 10px;
font-size: 18px;
`

class ReadOnlyExecutiveSummary extends Component {
    
    render() {

        return (
            <div className={ main }>
              <div className={ box }>
                <div className={ summary_header }>
                  <div className={ title_row }>
                    <span className={ circle }></span>
                    <span className={ card_title }>Rebranding</span>
                  </div>
                  <div className={ status_row }>
                    <span className={ status_text }>Under budget</span>
                    <span className={ spacer }>|</span>
                    <span className={ cx(status_text, red_text) }>Likely to miss deadline</span>
                  </div>
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {}
}

export default withRouter(connect(mapStateToProps)(ReadOnlyExecutiveSummary))

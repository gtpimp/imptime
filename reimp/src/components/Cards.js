import React, {Component} from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class Cards extends Component {
    render() {
        return (
            <div className={ main }>
              <div className={ box }>
                <div className={ header }>
                  <div className={ title_row }>
                    <span className={ card_title }>Cards</span>
                  </div>
                </div>
                <div className={ content }>
                  <div className={ content_row }>
                    <Link to="./cards/budget">Budget</Link>
                  </div>
                </div>
              </div>
            </div>
        )
    }
}

export default connect(null)(Cards)

const main = css`
display: flex;
flex: 1;
flex-direction: column;
min-height: 100vh;
background-color: ${theme.colours.page_background};
align-items: center;
`

const box = css`
width: 560px;
background-color: ${theme.colours.white};
margin-top: 50px;
box-shadow: ${theme.box_shadows.main};

@media (max-width: ${theme.breakpoints.mobile}) {
    width: 100%;
    height: 100%;
    box-shadow: none;
    border-radius: 0;
    border: none;
    position: absolute;
    left: 0;
    top: 0;
    margin-top: 0;
}
`

const header = css`
padding: 24px;
`
const title_row = css`
display: flex;
flex: 1;
align-items: center;
justify-content: flex-start;
`

const card_title = css`
font: ${theme.fonts.semibold_massive};
`

const content = css`
display: flex;
flex: 1;
flex-direction: column;
`

const content_row = css`
display: flex;
flex: 1;
flex-direction: column;
padding: 24px;
border-bottom: 1px solid #E6E6E6;
font: ${theme.fonts.regular_huge};
`

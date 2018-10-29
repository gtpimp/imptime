import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'

import { css, cx } from 'emotion'
import { default_theme as theme } from '../../theme/default'
import placeholder from '../../images/executive_summary_placeholder.jpg'

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
                <div className={ image_section }>
                  <img className={ placeholder_image } src={ placeholder } />
                </div>
                <div className={ summary_content }>
                  <div className={ content_row }>
                    <span className={content_title}>Deadline</span>
                    <span>24 Sept 2018</span>
                    <span>ETA: 28 Sept 2018</span>
                  </div>
                  <div className={ content_row }>
                    <span className={content_title}>Resource usage</span>
                    <span>R7,500/R10,000 (75%)</span>
                  </div>
                  <div className={ content_row }>
                    <span className={content_title}>How are we doing</span>
                    <span>+R5,000 (150%)</span>
                  </div>
                  <div className={context_description}>
                    <span className={content_title}>Description</span>
                    <span>Apply the new colour scheme to the web app, the mobile app and the emails. Note: does not include updating promotional website.</span>
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
flex-direction: column;
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

const image_section = css`
display: flex;
flex: 1;

`

const placeholder_image = css`
width: 100%;
height: 300px;
`

const summary_content = css`
display: flex;
flex: 1;
flex-direction: column;
`

const content_title = css`
font-weight: 500;
`

const context_description = css`
display: flex;
flex-direction: column;
`

const content_row = css`
padding: 24px;
border-bottom: 1px solid #E6E6E6;
font: ${theme.fonts.semibold_big}';
`

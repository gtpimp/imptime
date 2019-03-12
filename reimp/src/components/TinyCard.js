import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'
import { setSprintBreadcrumbsHelper } from '../actions/Breadcrumbs'

class TinyCard extends Component {

    refresh(sprint, project) {
        const { dispatch } = this.props
        dispatch(setSprintBreadcrumbsHelper(project, sprint))
    }
    
    render() {
        const { children, title, project_name, sprint_name } = this.props
        return (
            <div className={ main }>
              <div className={ box }>
                <div className={ header }>
                  <div className={ title_row }>
                    <span className={ card_title }>{title}</span>
                  </div>
                  <div className={ details_row }>
                    <span className={ card_details }>{project_name}</span>
                    <span className={ card_details }>&nbsp;-&nbsp;</span>
                    <span className={ card_details }>{sprint_name}</span>
                  </div>
                </div>
                <div className={ content }>
                    {children}
                </div>
              </div>
            </div>
        )
    }
}

export default TinyCard

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
const details_row = css`
display: flex;
flex: 1;
align-items: center;
justify-content: flex-start;
`

const card_title = css`
font: ${theme.fonts.semibold_massive};
`

const card_details = css`
font: ${theme.fonts.semibold_big};
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
max-width: 280px;
`

const content = css`
display: flex;
flex: 1;
flex-direction: column;
`

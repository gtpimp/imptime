import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'

import { default_theme as theme } from '../theme/default'
import { getIssue } from '../actions/Issues'
import Timestamp from './Timestamp'
import OtherUser from './OtherUser'

const main = css`
display: flex;
flex-direction: row;
padding-bottom: ${theme.spacing.three};
`

const left_column = css`
display: flex;
flex: 4;
justify-content: flex-start;
align-items: center;
font: ${theme.fonts.regular_normal};
color: ${theme.colours.normal_text};
`
const right_column = css`
display: flex;
flex: 6;
justify-content: flex-end;
align-items: center;
font: ${theme.fonts.semibold_normal};
color: ${theme.colours.link};
`

const info = css`
display: flex;
flex: 1;
justify-content: flex-start;
align-items: center;
`

class IssueSidebarDetail extends Component {

    render() {
        const { label, children } = this.props

        return (
            <div className={ main }>
              <div className={left_column}>{label}</div>
              <div className={right_column}>
                <div className={ info }>
                  { children }
                </div>
              </div>
            </div>
        )
    }
}
export default IssueSidebarDetail

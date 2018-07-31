import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class DivTableHeaderCell extends Component {

    render() {

        let { extra_style } = this.props

        extra_style = extra_style || {}
        
        return (
            <div className={css`color: ${theme.colours.strong_text};
                                padding-left: 6px;
                                padding-top: 6px;
                                margin-left: 6px;
                                margin-right: 6px;
                                display: flex;
                                height: 24px;
                                flex: ${extra_style.flex || "0 0 190px"};
                                max-width: ${extra_style.maxWidth || "auto"};
                                border-right: 2px solid ${theme.colours.cell_separator};
                                &:hover: {
                                  cursor: pointer;
                                  background-color: ${theme.colours.list_highlight};
                                };


                               `}>
                 {this.props.children}
            </div>
        )
    }
    
}

export default DivTableHeaderCell


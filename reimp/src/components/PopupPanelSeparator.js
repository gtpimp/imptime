import React, {Component} from 'react'
import { css } from 'emotion'

class PopupPanelSeparator extends Component {

    render() {
        const { strong } = this.props
        return (
            <div className={css`height:${strong ? "24px" : "12px"}; border-bottom: ${strong ? "1px" : "0px"} solid #000000; `}>
            </div>
        )
    }
    
}

export default PopupPanelSeparator


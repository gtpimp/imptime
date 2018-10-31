import React, {Component} from 'react'
import { css } from 'emotion'

class NavTabPopup extends Component {

    render() {
        const { position } = this.props
        return (
            <div className={css`position:absolute;
                                left: ${position || "auto"};
                                top: 33px;
                                display: flex;
                                z-index:9;`} >
                 {this.props.children}
            </div>
        )
    }
    
}

export default NavTabPopup


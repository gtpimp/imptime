import React, {Component} from 'react'
import {css} from 'emotion'

class BreadcrumbSeparator extends Component {

    render() {

        return (
            <div className={css`align-items: center;
                            display: inline-flex;
                            padding-left: 16px;
                            padding-right: 16px;
            `}>
              <i className="material-icons">chevron_right</i>
            </div>
        )
    }
    
}

export default BreadcrumbSeparator

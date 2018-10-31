import React, {Component} from 'react'
import { cx, css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class ResponsiveLayout extends Component {
    render() {
        const { children } = this.props
        return (
            <div>
              { children }
            </div>
        )
    }
}
export default ResponsiveLayout

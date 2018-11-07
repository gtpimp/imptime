import React, {Component} from 'react'

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

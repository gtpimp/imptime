import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import SplitPane from 'react-split-pane'
import { setGlobalPageFlag, getGlobalPageFlag } from '../actions/Page'

class Splitter extends Component {

    constructor(props) {
        super(props)
        this.saveSize = this.saveSize.bind(this)
    }

    saveSize(value) {
        const { dispatch, name } = this.props
        dispatch(setGlobalPageFlag(name, value))
    }

    render() {
        const size = this.props.size
        const left = this.props.children[0]
        const right = this.props.children[1]
        const minSize = this.props.minSize || 50
        const split = this.props.vertical || "vertical"

        return (
            <div className="main-layout__scroll-panel main-layout__scroll-container">
              <SplitPane style={{position:'relative'}}
                         paneStyle={{display:'flex'}}
                         split={split}
                         minSize={minSize}
                         defaultSize={size}
                         onChange={this.saveSize}
                         {...this.props}
              >
                <div className="main-layout__inner_scroll-panel">
                  {left}
                </div>
                <div className="main-layout__inner_scroll-panel">
                  {right}
                </div>
              </SplitPane>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { name } = props
    const size = getGlobalPageFlag(state, name, "80%")
    return {
        name: name || "generic_splitter",
        size
    }
}

export default withRouter(connect(mapStateToProps)(Splitter))

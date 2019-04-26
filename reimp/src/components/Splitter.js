import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import SplitPane from 'react-split-pane'
import Toolbar from './toolbar/Toolbar'
import { setGlobalPageFlag, getGlobalPageFlag } from '../actions/Page'
import styled from 'react-emotion'
import { default_theme as theme } from '../theme/default'

const pane_css = { display:"flex",
                   flexDirection:"column",
                   width: "100%"}

const SplitPaneLeft = styled('div')(props => Object.assign(
    {}, pane_css,
    {backgroundColor: theme.colours.left_panel_background,
     overflow: "hidden"}
))
const SplitPaneRight = styled('div')(props => Object.assign(
    {}, pane_css,
    {backgroundColor: theme.colours.right_panel_background,
     overflow: "auto"}
))

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

        if ( right === undefined || right === null ) {
            return (
                <SplitPaneLeft>
                  <Toolbar />
                  {left}
                </SplitPaneLeft>
            )
        }
        
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
                <SplitPaneLeft>
                  <Toolbar/>
                  {left}
                </SplitPaneLeft>
                <SplitPaneRight>
                  {right}
                </SplitPaneRight>
              </SplitPane>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { defaultSize, name } = props
    const size = getGlobalPageFlag(state, name, defaultSize || "80%")
    return {
        name: name || "generic_splitter",
        size
    }
}

export default withRouter(connect(mapStateToProps)(Splitter))

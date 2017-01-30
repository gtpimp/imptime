import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'

class IssueToolbarPanel extends Component {

    onNewLabelClick() {
        console.log('new label clicked')
    }

    onCollapseFeaturesClick() {
        console.log('collapse features clicked')
    }

    onExpandFeaturesClick() {
        console.log('expand features clicked')
    }

    onExpandFeaturesClick() {
        console.log('expand features clicked')
    }

    onMakeFeatureClick() {
        console.log('make feature clicked')
    }

    onUnmakeFeatureClick() {
        console.log('unmake feature clicked')
    }

    onGroupClick() {
        console.log('group clicked')
    }

    onUngroupClick() {
        console.log('ungroup clicked')
    }

    onAttachClick() {
        console.log('attach clicked')
    }

    onAssignClick() {
        console.log('assign clicked')
    }

    onEstimateClick() {
        console.log('estimate clicked')
    }

    render() {
        return (
            <div className="toolbar-panel">
                Issue:
                <ToolbarButton flavour="toggle" icon="stars" isEnabled={true} onEnable={this.onMakeFeatureClick} onDisable={this.onUnmakeFeatureClick}/>
                <ToolbarButton icon="label" onClick={this.onNewLabelClick}/>
                <ToolbarButton icon="expand_more" onClick={this.onExpandFeaturesClick}/>
                <ToolbarButton icon="expand_less" onClick={this.onCollapseFeaturesClick}/>
                <ToolbarButton icon="call_merge" onClick={this.onGroupClick}/>
                <ToolbarButton icon="call_split" onClick={this.onUngroupClick}/>
                <ToolbarButton icon="attach_file" onClick={this.onAttachClick}/>
                <ToolbarButton icon="exit_to_app" onClick={this.onAssignClick}/>
                <ToolbarButton icon="alarm" onClick={this.onEstimateClick}/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(IssueToolbarPanel)

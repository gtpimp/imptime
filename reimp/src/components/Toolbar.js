import React, {Component} from 'react'
import {connect} from 'react-redux'

class Toolbar extends Component {

    render() {
        return (
            <div className="toolbar">
                <div className="toolbar__container">
                    <div className="toolbar__item">
                    <button className="button button--default button--primary">New (N)</button>
                    </div>
                    <div className="toolbar__item">
                    <div className="toolbar__label">Inbox</div>
                    </div>
                </div>
                <div className="toolbar__container">
                    <div className="toolbar__item toolbar__item--icon-button">
                        <div className="icon--info"/>
                    </div>
                    <div className="toolbar__item toolbar__item--icon-button">
                        <div className="icon--settings"/>
                    </div>
                    <div className="toolbar__item toolbar__item--icon-button">
                        <div className="icon--more"/>
                    </div>
                    <div className="toolbar__separator"></div>
                    <div className="toolbar__item">
                        <div className="mode__dropdown">Richard Mode</div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(Toolbar)

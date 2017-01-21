import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'

class Toolbar extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        const {value} = this.props
        return (
            <div className="toolbar">
                <div className="toolbar__container">
                    <div className="toolbar__item">
                    <button className="button button--primary">New (N)</button>
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

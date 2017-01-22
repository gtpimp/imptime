import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import IssueDetails2 from '../components/IssueDetails2'
import Attachments from '../components/Attachments'

const groups = [
    {
        items: [
            {
                label: 'Add/Edit'
            }]
    },
    {
        items: [
            {
                icon: 'subject',
                label: 'Description'
            },
            {
                icon: 'stars',
                label: 'Feature'
            },
            {
                icon: 'input',
                label: 'Sprint'
            },
            {
                icon: 'attachment',
                label: 'Attach'
            },
            {
                icon: 'assignment_turned_in',
                label: 'Testables'
            },
            {
                icon: 'person_add',
                label: 'Assign'
            },
            {
                icon: 'access_time',
                label: 'Estimate'
            },
            {
                icon: 'bookmark',
                label: 'Tag'
            }]
    },
    {
        items: [{
            icon: 'delete',
            label: 'Delete'
        }]
    }
]
class IssueDetails extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        const {value} = this.props
        return (
            <div className="issue-details">
                <div className="issue-details__toolbar">
                    <div className="issue-details__toolbar__container">
                        <div className="issue-details__toolbar-back">
                            <i className="material-icons">arrow_back</i>
                        </div>
                        <div className="issue-details__toolbar-label">Sprint 1</div>
                    </div>
                    <div className="issue-details__toolbar__container">
                        <div className="issue-details__toolbar-mode-icon issue-details__toolbar-mode-icon--unselected"><i className="material-icons">access_time</i></div>
                        <div className="issue-details__toolbar-mode-icon issue-details__toolbar-mode-icon--selected"><i className="material-icons">monetization_on</i></div>
                    </div>
                </div>
                <div className="issue-details__workspace">
                    <div className="issue-details__left-menu">
                        {groups.map((group, index) =>
                            <div className="issue-details__left-menu-group" key={'group-' + index}>
                                {group.items.map((item, index) =>
                                    <div className="issue-details__left-menu-item" key={'item-' + index}>
                                        { item.icon &&
                                        <span className="issue-details__left-menu-item-component issue-details__left-menu-item-icon">
                                            <i className="material-icons">{item.icon}</i>
                                        </span>
                                        }
                                        <span className="issue-details__left-menu-item-component issue-details__left-menu-item-label">{item.label}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="issue-details__content">
                        <div className="issue-details__feature-pane">
                            feature details
                        </div>
                        <div className="issue-details__issue-pane">
                            <div className="issue-details__issue-details-pane">
                                <IssueDetails2/>
                            </div>
                            <div className="issue-details__attachments-pane">
                                <Attachments/>
                            </div>
                        </div>
                        <div className="issue-details__issues-pane">
                            sub issues go here
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(IssueDetails)

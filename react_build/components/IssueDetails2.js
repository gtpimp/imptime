import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import Progress from '../components/Progress'
import Timer from '../components/Timer'
import Tag from '../components/Tag'
import AttachmentLink from '../components/AttachmentLink'


class IssueDetails2 extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        // const { issue } = this.props
        const issue = {}
        return (
            <div className="issue-details2">
                <div className="issue-details2__section">
                    <div className="issue-details2__title">
                        <div className="issue-details2__title-component issue-details2__title-icon">
                            <div className="icon--feature"></div>
                        </div>
                        <div className="issue-details2__title-component issue-details2__title-label">Registration Form</div>
                    </div>
                </div>
                <div className="issue-details2__section">
                    <div className="issue-details2__description">Malesuada fames purus venenatis nascetur ullamcorper cras fringilla ligula sociis sociosqu aptent at vestibulum vulputate leo cubilia
                        potenti parturient vestibulum a tincidunt interdum orci fringilla at a posuere.Primis iaculis mi sed fusce per donec.
                    </div>
                </div>
                <div className="issue-details2__section">
                    <div className="issue-details2__section-title">Testables</div>
                    <ul className="issue-details2__testables-list">
                        <li>Testable one</li>
                        <li>
                            <div>Testable two</div>
                            <ul>
                                <li>Testable two point one</li>
                            </ul>
                        </li>
                        <li>Testable three</li>
                    </ul>
                </div>
                <div className="issue-details2__section">
                    <div className="issue-details2__tags">
                        <Tag category="type" name="bug"/>
                        <Tag category="module" name="candidates"/>
                    </div>
                </div>
                <div className="issue-details2__section">
                    <div className="issue-details2__progress">
                        <div className="issue-details2__progress-component issue-details2__progress-component--timer">
                            <Timer />
                        </div>
                        <div className="issue-details2__progress-component issue-details2__progress-component--progress">
                            <Progress issue={issue}/>
                        </div>
                    </div>
                </div>
                <div className="issue-details2__section">
                    <div className="issue-details2__section-title">Estimates</div>
                    <table className="table issue-details2__estimates">
                        <tbody>
                        <tr>
                            <td className="issue-details2__estimates-time">1.00</td>
                            <td className="issue-details2__estimates-estimator">Richard</td>
                        </tr>
                        <tr>
                            <td className="issue-details2__estimates-time">1.00</td>
                            <td className="issue-details2__estimates-estimator">Gareth</td>
                        </tr>
                        <tr>
                            <td className="issue-details2__estimates-time">1.00</td>
                            <td className="issue-details2__estimates-estimator">Keith</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div className="issue-details2__section">
                    <div className="issue-details2__section-title">Attachments</div>
                    <div className="table issue-details2__attachments">
                        <div className="table issue-details2__attachment">
                            <AttachmentLink attachment={ {label: 'Scope of work.pdf'}}/>
                        </div>
                        <div className="table issue-details2__attachment">
                            <AttachmentLink attachment={ {label: 'https://invis.io/XXXXXXXXXX'}}/>
                        </div>
                    </div>
                </div>
                <div className="issue-details2__save">
                    <button className="button button--large button--primary button--save">Save</button>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(IssueDetails2)

import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import ProjectList from '../components/ProjectList'
import SprintList from '../components/SprintList'
import IssueList from '../components/IssueList'
import IssueDetails from '../components/IssueDetails'
import IssueDeveloperDetails from '../components/IssueDeveloperDetails'
import {StickyContainer} from 'react-sticky';
import {
    LIST_KEY__PROJECT_LIST,
    LIST_KEY__SPRINT_LIST,
    LIST_KEY__ISSUE_LIST,
    LIST_KEY__ISSUE_DEVELOPER_DETAILS
} from '../actions/ItemListKeyRegistry'
import {
    expand_list
} from '../actions/ItemList'
import PropertyStack from '../components/PropertyStack'
import PropertyStackComponent from '../components/PropertyStackComponent'
import Timestamp from '../components/Timestamp'
import moment from 'moment'

class TeamPage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {dispatch} = this.props
        // dispatch(expand_list(LIST_KEY__SPRINT_LIST))
    }

    render() {

        return (
            <div>
                {/*<ProjectList key="projects" list_key={LIST_KEY__PROJECT_LIST}/>*/}
                Team
                <PropertyStack>
                    <PropertyStackComponent>
                        <div className="property--parent-title">
                            <div className="property-label-1">Katalyst</div>
                        </div>
                        <div className="property--title">
                            <div className="property-label-2">Sprinasdfdsafdasfdsafasfasfdasfasfasfdsaasfasft 3</div>
                        </div>
                    </PropertyStackComponent>
                    <PropertyStackComponent>
                        <div className="property-text">Interactive Prototype and develppment of Nunc a adipiscing parturient ullamcorper parturient adipiscing scelerisque donec risus penatibus
                            parturient.
                        </div>
                    </PropertyStackComponent>
                    <PropertyStackComponent>
                        <div className="named-property">
                            <div className="named-property__name">Created</div>
                            <div className="named-property__value"><Timestamp style="short-date" value={moment()}/></div>
                        </div>
                    </PropertyStackComponent>
                    <PropertyStackComponent>
                        <div className="named-property">
                            <div className="named-property__name">First Activity</div>
                            <div className="named-property__value"><Timestamp style="short-date" value={moment()}/></div>
                        </div>
                    </PropertyStackComponent>
                </PropertyStack>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const {} = state

    return {}
}

export default connect(mapStateToProps)(TeamPage)


import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ProjectList from '../components/ProjectList'
import SprintList from '../components/SprintList'
import IssueList from '../components/IssueList'
import IssueDeveloperDetails from '../components/IssueDeveloperDetails'
import { StickyContainer } from 'react-sticky';
import {
    LIST_KEY__PROJECT_LIST,
    LIST_KEY__SPRINT_LIST,
    LIST_KEY__ISSUE_LIST,
    LIST_KEY__ISSUE_DEVELOPER_DETAILS
} from '../actions/ItemListKeyRegistry'

class DevPage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const { dispatch } = this.props
    }

    render() {

        return (
            <div>
		<StickyContainer>
            <div className="devpage__navigation__lists">
                <ProjectList key="projects" list_key={LIST_KEY__PROJECT_LIST}/>
                <SprintList key="sprints" list_key={LIST_KEY__SPRINT_LIST}/>
            </div>

		    <div className="devpage__workarea">
			<IssueList key="issues" list_key={LIST_KEY__ISSUE_LIST}>
			    <IssueDeveloperDetails key="issue_developer_details"
						   list_key={LIST_KEY__ISSUE_DEVELOPER_DETAILS} />
			</IssueList>
		    </div>
		</StickyContainer>
	    </div>
        )
    }
}

function mapStateToProps(state) {
    const {} = state

    return {
    }
}

export default connect(mapStateToProps)(DevPage)


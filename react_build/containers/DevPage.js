import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ProjectList from '../components/ProjectList'
import SprintList from '../components/SprintList'
import IssueList from '../components/IssueList'
import IssueDeveloperDetails from '../components/IssueDeveloperDetails'
import { StickyContainer } from 'react-sticky';

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
			<ProjectList key="projects" list_key="projects"/>
			<SprintList key="sprints" list_key="sprints"/>
		    </div>

		    <div className="devpage__workarea">
			<IssueList key="issues" list_key="issues">
			    <IssueDeveloperDetails key="issue_developer_details"
						   list_key="issue_developer_details" />
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


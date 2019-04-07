import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Route, Switch, withRouter } from 'react-router-dom'
import { setBrowserTitle } from '../../actions/Page'
import SimplifiedExecutiveSummaryPage from './SimplifiedExecutiveSummaryPage'
import SimplifiedWelcomePage from './SimplifiedWelcomePage'
import SimplifiedProjectsPage from './SimplifiedProjectsPage'
import SimplifiedProjectPage from './SimplifiedProjectPage'
import SimplifiedSprintPage from './SimplifiedSprintPage'

class MobileRouter extends Component {

    render() {

        setBrowserTitle('ImpTime')
        
        return (
            <Switch>
              <Route exact path="/wd/" component={SimplifiedWelcomePage} />
              <Route exact path="/wd/projects/" component={SimplifiedProjectsPage} />
              <Route exact path="/wd/projects/:projectId/" component={SimplifiedProjectPage} />
              <Route exact path="/wd/projects/:projectId/sprints/:sprintId/" component={SimplifiedSprintPage} />
              <Route exact path="/wd/projects/:projectId/sprints/:sprintId/executive_summary" component={SimplifiedExecutiveSummaryPage} />
            </Switch>
        )
    }
    
}

function mapStateToProps(state) {
    return {}
}

export default withRouter(connect(mapStateToProps)(MobileRouter))

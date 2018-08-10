import React, {Component} from 'react'
import BreadcrumbCell from '../BreadcrumbCell'
import BreadcrumbSeparator from '../BreadcrumbSeparator'
import IssueName from '../IssueName'
import SprintName from '../SprintName'
import ProjectName from '../ProjectName'
import { css } from 'emotion'


class AutoClockInlineIssue extends Component {

    render() {
        const { project_id, sprint_id, issue_id, onSelect } = this.props
        return (
            <div className={css`display:flex`} onClick={onSelect}>
              <BreadcrumbCell>
                <ProjectName project_id={project_id} />
              </BreadcrumbCell>
              <BreadcrumbSeparator/>
              <BreadcrumbCell>
                <SprintName sprint_id={sprint_id} />
              </BreadcrumbCell>
              <BreadcrumbSeparator/>
              <BreadcrumbCell>
                <IssueName issue_id={issue_id} />
              </BreadcrumbCell>
            </div>
        )
    }
    
}

export default AutoClockInlineIssue


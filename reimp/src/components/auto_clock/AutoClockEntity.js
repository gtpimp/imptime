import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import ProjectName from '../ProjectName'
import SprintName from '../SprintName'
import IssueName from '../IssueName'

class AutoClockEntity extends Component {

    render() {
        const { project_id, sprint_id, issue_id, className } = this.props
        
        return (
            <div className={classNames("auto-clock-entry__entities", {className:className})}>
              { project_id && 
                <div className="auto-clock-entry__label">
                  Project:
                </div>
              }
              { project_id && 
                <div className="auto-clock-entry__field auto-clock-entry__project_name">
                  <ProjectName project_id={project_id} />
                </div>
              }
              { sprint_id && 
                <div className="auto-clock-entry__label">
                  Sprint:
                </div>
              }
              { sprint_id && 
                <div className="auto-clock-entry__field auto-clock-entry__sprint_name">
                  <SprintName sprint_id={sprint_id} />
                </div>
              }
              { issue_id && 
                <div className="auto-clock-entry__label">
                  Issue:
                </div>
              }
              { issue_id && 
                <div className="auto-clock-entry__field auto-clock-entry__issue_name">
                  <IssueName issue_id={issue_id} />
                </div>
              }
            </div>
        )
    }
}
    
export default AutoClockEntity

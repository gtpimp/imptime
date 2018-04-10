import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router-dom'
import '../sass/breadcrumb.css'
import { map, get, filter } from 'lodash'
import { startCandidateProject } from '../actions/Projects'
import { startCandidateSprint } from '../actions/Sprints'
import {
    startCandidateIssue,
    startCandidateFeature,
    deleteIssues,
    updateIssueToggleAsFeature
} from '../actions/Issues'
import { logged_in_users_permissions } from '../actions/Users'

const menu_buttons = {

    'projects': [
        { label: (objs) => '+ New Project',
          dispatch_action: (objs) => startCandidateProject() }
    ],
    'project': [
        { label: (objs) => 'Sprints',
          nav_url: (objs) => '/projects/' + objs.project.id + '/sprints'
        },
        { label: (objs) => 'Dashboard',
          nav_url: (objs) => '/projects/' + objs.project.id + '/dashboard'
        },
        { label: (objs) => 'Statement',
          nav_url: (objs) => '/projects/' + objs.project.id + '/projectStatement'
        },
        { label: (objs) => 'Roadmap',
          nav_url: (objs) => '/projects/' + objs.project.id + '/roadmap'
        },
        { label: (objs) => 'Gallery',
          nav_url: (objs) => '/projects/' + objs.project.id + '/gallery/'
        },
        { label: (objs) => 'Wiki',
          nav_url: (objs) => '/projects/' + objs.project.id + '/wiki/',
          perms: (objs) => ['has_view_business_comments']
        },
        { label: (objs) => 'Users',
          nav_url: (objs) => '/projects/' + objs.project.id + '/users'
        },
    ],
    'sprints': [
        { label: (objs) => '+ New Sprint',
          dispatch_action: (objs) => startCandidateSprint(objs.project.id, objs.sprint.id)
        }
    ],
    'sprint': [
        { label: (objs) => 'Issues',
          nav_url: (objs) => '/projects/' + objs.project.id + '/sprints/' + objs.sprint.id + '/issues'
        },
        { label: (objs) => 'Bulk Create Issues',
          nav_url: (objs) => '/projects/' + objs.project.id + '/sprints/' + objs.sprint.id + '/bulkCreate',
          perms: (objs) => ['has_add_issue']
        },
        { label: (objs) => 'Dashboard',
          nav_url: (objs) => '/projects/' + objs.project.id + '/sprints/' + objs.sprint.id + '/dashboard'
        },
        { label: (objs) => 'Rates',
          nav_url: (objs) => '/projects/' + objs.project.id + '/sprints/' + objs.sprint.id + '/rates',
          perms: (objs) => ['has_view_ctc_billable_rates']
        },
        { label: (objs) => 'Cost Summary',
          nav_url: (objs) => '/projects/' + objs.project.id + '/sprints/' + objs.sprint.id + '/costSummary',
          perms: (objs) => ['has_view_ctc_billable_rates']
        },
    ],
    'issues': [
        { label: (objs) => '+ New Issue',
          dispatch_action: (objs) => startCandidateIssue(objs.sprint.id, objs.issue.id)
        },
        { label: (objs) => '+ New Feature',
          dispatch_action: (objs) => startCandidateFeature(objs.sprint.id, objs.issue.id)
        },
        { label: (objs) => 'Bulk Create Issues',
          nav_url: (objs) => '/projects/' + objs.project.id + '/sprints/' + objs.sprint.id + '/bulkCreate'
        }
    ],
    'issue': [
        { label: (objs) => 'Toggle as feature',
          dispatch_action: (objs) => updateIssueToggleAsFeature([objs.issue.id], 'toggle')
        },
        { label: (objs) => 'Delete',
          dispatch_action: (objs) => (confirm("Delete issue " + objs.issue.number +"?") && deleteIssues([objs.issue.id])) || null
        },
    ]
    
}

class Breadcrumb extends Component {

    constructor(props) {
        super(props)
        this.showBreadCrumbMenu = this.showBreadCrumbMenu.bind(this)
        this.hideBreadCrumbMenu = this.hideBreadCrumbMenu.bind(this)
        this.onClickBreadcrumbActionButton = this.onClickBreadcrumbActionButton.bind(this)
        this.state = {show_breadcrumb_menu:false}
    }

    showBreadCrumbMenu() {
        this.setState({show_breadcrumb_menu:true})
    }

    hideBreadCrumbMenu() {
        this.setState({show_breadcrumb_menu:false})
    }

    onClickBreadcrumbActionButton(breadcrumb_button) {
        const { dispatch, history, breadcrumb } = this.props

        if ( breadcrumb_button['dispatch_action'] ) {
            const action = breadcrumb_button['dispatch_action'](breadcrumb.selected_entities)
            if ( action ) {
                dispatch(action)
            }
        } else {
            history.push(breadcrumb_button['nav_url'](breadcrumb.selected_entities))
        }
    }

    renderBreadcrumbLink(button, breadcrumb, key) {
        const label = button.label(breadcrumb.selected_entities)
        if ( button['dispatch_action'] ) {
            return (
                <div key={key}
                     className="breadcrumb-menu__item"
                     onClick={() => this.onClickBreadcrumbActionButton(button)}>
                  {label}
                </div>
            )
        } else {
            return (
                <div key={key} className="breadcrumb-menu__item">
                  <Link to={button['nav_url'](breadcrumb.selected_entities)}>
                    {label}
                  </Link>
                </div>
            )
        }
    }
    
    render() {
        const {label, to, is_last, breadcrumb, permissions } = this.props
        const { show_breadcrumb_menu } = this.state
        const that = this

        const buttons = show_breadcrumb_menu && menu_buttons[breadcrumb.type]

        return (
            <div className="breadcrumb" onMouseLeave={this.hideBreadCrumbMenu}>
              <Link to={to}
                    onMouseOver={this.showBreadCrumbMenu}>
                {label}
              </Link>
              { buttons && 
                <div className="breadcrumb-menu">
                  <Link className="breadcrumb-menu__item" to={to}>
                    {label}
                  </Link>
                  { map(buttons, function(button, index) {
                        const can_view = button.perms === undefined || permissions === null ||
                                         filter(button.perms(breadcrumb.selected_entities), (perm) => permissions[perm] === true).length>0
                        if ( ! can_view ) {
                            return null
                        }
                        return that.renderBreadcrumbLink(button, breadcrumb, index)
                    })
                  }
                </div>
              }
              { !is_last &&
                <div className="breadcrumb__separator"><i className="material-icons">chevron_right</i></div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { breadcrumb } = props
    const project_id = get(breadcrumb, ["selected_entities", "project", "id"], null)
    const permissions = (project_id && logged_in_users_permissions(state, project_id)) || null

    return {
        label: breadcrumb.label,
        to: breadcrumb.to,
        breadcrumb,
        permissions
    }
}

export default withRouter(connect(mapStateToProps)(Breadcrumb))

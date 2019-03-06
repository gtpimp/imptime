import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router-dom'
import { map, get, filter } from 'lodash'
import { startCandidateProject } from '../actions/Projects'
import { startCandidateSprint } from '../actions/Sprints'
import { startMinutesEditor } from '../actions/Issues'
import { startCandidateFeature } from '../actions/Features'
import {
    startCandidateIssue,
    deleteIssues,
    updateIssueToggleAsFeature,
    expandAllFeatures,
    collapseAllFeatures
} from '../actions/Issues'
import { logged_in_users_permissions } from '../actions/Users'
import { startPermissionInspector } from '../actions/Auth'
import { startSprintSnapshotSelector } from '../actions/SprintSnapshots'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import styled from 'react-emotion'
import PopupPanel from './PopupPanel'
import PopupPanelLink from './PopupPanelLink'
import PopupPanelButton from './PopupPanelButton'
import PopupPanelSeparator from './PopupPanelSeparator'
import PopupPanelHeading from './PopupPanelHeading'
import SprintSnapshotSelector from './SprintSnapshotSelector'
import BreadcrumbCell from './BreadcrumbCell'
import BreadcrumbSeparator from './BreadcrumbSeparator'

const BreadcrumbMenuDiv = styled('div')(props => ({
    position: 'absolute',
    top: '65px',
    minWidth: '145px',
    zIndex: '9',
    borderRadius: '3px',
}))

const menu_buttons = {

    'projects': [
        { label: (objs) => '+ New Project',
          type: "button",
          generic_action: function(objs, props) {
              props.dispatch(startCandidateProject())
              props.history.push('/projects/')
          }}
    ],
    'project': [
        { label: (objs) => "Manage this project",
          type: "heading"
        },
        { label: (objs) => 'Sprints',
          nav_url: (objs) => '/projects/' + objs.project.id + '/sprints'
        },
        { label: (objs) => 'Features',
          nav_url: (objs) => '/projects/' + objs.project.id + '/features'
        },
        { label: (objs) => 'Decision journal',
          nav_url: (objs) => '/projects/' + objs.project.id + '/journals/',
          perms: (objs) => ['has_view_decision_journal']
        },
        { label: (objs) => 'Wiki',
          nav_url: (objs) => '/projects/' + objs.project.id + '/wiki/',
          perms: (objs) => ['has_view_business_comments']
        },
        { label: (objs) => 'Users',
          nav_url: (objs) => '/projects/' + objs.project.id + '/users/'
        },
        { label: (objs) => 'Gallery and attachments',
          nav_url: (objs) => '/projects/' + objs.project.id + '/gallery/'
        },
        { label: (objs) => 'Recon',
          nav_url: (objs) => '/projects/' + objs.project.id + '/recon/'
        },
        { label: (objs) => "Summaries",
          type: "heading"
        },
        { label: (objs) => 'Roadmap',
          nav_url: (objs) => '/projects/' + objs.project.id + '/roadmap'
        },
        { label: (objs) => 'Dashboard',
          nav_url: (objs) => '/projects/' + objs.project.id + '/dashboard'
        },
        { label: (objs) => 'Statement',
          nav_url: (objs) => '/projects/' + objs.project.id + '/projectStatement'
        },
        
        { label: (objs) => "Other",
          type: "heading"
        },
        { label: (objs) => 'Minutes',
          dispatch_action: (objs, props) => startMinutesEditor(objs.project.id,
                                                               (issue) => props.history.push('/projects/' + issue.project_id + '/sprints/' + issue.sprint_id + "/issues/" + issue.id)),
          perms: (objs) => ['has_add_issue']
        },
        { label: (objs) => 'Permission inspector',
          dispatch_action: (objs) => startPermissionInspector(objs.project.id),
          perms: (objs) => ['has_view_permissions']
        }
    ],
    'company': [
        { label: (objs) => "Manage this company",
          type: "heading"
        },
        { label: (objs) => 'Users',
          nav_url: (objs) => '/companies/' + objs.company.id + '/users/'
        },
        { label: (objs) => "Experimental",
          type: "separator"
        },
        { label: (objs) => 'Checklists',
          nav_url: (objs) => '/company/problems'
        },
        { label: (objs) => 'Billable hours',
          nav_url: (objs) => '/company/billable_hours'
        },
        { label: (objs) => 'Timesheets',
          nav_url: (objs) => '/usertimesheets'
        },
        { label: (objs) => 'Daily work summary',
          nav_url: (objs) => '/work_summary'
        },
        { label: (objs) => 'Dashboard',
          nav_url: (objs) => '/dashboard'
        },
        { label: (objs) => 'Invoices',
          nav_url: (objs) => `/companies/${objs.company.id}/invoices`
        }
    ],
    'features': [
        { label: (objs) => 'Bulk Create Features',
          nav_url: (objs) => '/projects/' + objs.project.id + '/bulkCreateFeatures',
          perms: (objs) => ['has_edit_feature']
        },
        { label: (objs) => '+ New top level feature',
          perms: (objs) => ['has_edit_feature'],
          type: "button",
          generic_action: function(objs, props) {
              props.dispatch(startCandidateFeature(objs.project.id, (objs.feature && objs.feature.id) || null))
              props.history.push('/projects/' + objs.project.id + '/features/')
          }
        }
    ],
    'sprints': [
        { label: (objs) => '+ New sprint',
          type: "button",
          generic_action: function(objs, props) {
              props.dispatch(startCandidateSprint(objs.project.id, (objs.sprint && objs.sprint.id) || null))
              props.history.push('/projects/' + objs.project.id + '/sprints/')
          }
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
        { label: (objs) => 'Executive Summary',
          nav_url: (objs) => '/projects/' + objs.project.id + '/sprints/' + objs.sprint.id + '/executive_summary',
          perms: (objs) => ['has_view_ctc_billable_rates']
        },
        { label: (objs) => 'Cost Summary',
          nav_url: (objs) => '/projects/' + objs.project.id + '/sprints/' + objs.sprint.id + '/costSummary',
          perms: (objs) => ['has_view_ctc_billable_rates']
        },
        { label: (objs) => 'Proposal',
          nav_url: (objs) => '/projects/' + objs.project.id + '/sprints/' + objs.sprint.id + '/proposal'
        },
        { label: (objs) => 'Recon',
          nav_url: (objs) => '/projects/' + objs.project.id + '/sprints/' + objs.sprint.id + '/recon'
        },
        { label: (objs) => 'Snapshots',
          perms: (objs) => ['has_view_ctc_billable_rates'],
          generic_action: function(objs, props) {
              props.dispatch(startSprintSnapshotSelector())
        }}
    ],
    'issues': [
        { label: (objs) => 'Bulk Create Issues',
          nav_url: (objs) => '/projects/' + objs.project.id + '/sprints/' + objs.sprint.id + '/bulkCreate'
        },
        { label: (objs) => 'Expand All',
          dispatch_action: (objs) => expandAllFeatures(objs.issues),
        },
        { label: (objs) => 'Collapse All',
          dispatch_action: (objs) => collapseAllFeatures(objs.issues)          
        },
        { label: (objs) => '+ New Issue',
          type: "button",
          dispatch_action: (objs) => startCandidateIssue(objs.sprint.id, objs.issue.id)
        },
    ],
    'issue': [
        { label: (objs) => 'Toggle as feature',
          dispatch_action: (objs) => updateIssueToggleAsFeature([objs.issue.id], 'toggle')
        },
        { label: (objs) => 'Delete',
          dispatch_action: (objs) => (window.confirm("Delete issue " + objs.issue.number +"?") && deleteIssues([objs.issue.id])) || null
        },
        { label: (objs) => 'History',
          nav_url: (objs) => '/projects/' + objs.project.id + '/sprints/' + objs.sprint.id + '/issues/' + objs.issue.id + '/history',
          perms: (objs) => ['has_view_issue_history']
        },
        { label: (objs) => 'Clocked times',
          nav_url: (objs) => '/clock/history/issue/' + objs.issue.id,
          perms: (objs) => ['has_view_actual_hours']
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
        const { dispatch, history, breadcrumb, issues } = this.props
        if ( breadcrumb.selected_entities ) {
            breadcrumb.selected_entities.issues = issues
        }

        if ( breadcrumb_button['generic_action'] ) {
            const action = breadcrumb_button['generic_action'](breadcrumb.selected_entities, this.props)
            if ( action ) {
                action()
            }
            
        } else if ( breadcrumb_button['dispatch_action'] ) {
            const action = breadcrumb_button['dispatch_action'](breadcrumb.selected_entities, this.props)
            if ( action ) {
                dispatch(action)
            }
        } else {
            history.push(breadcrumb_button['nav_url'](breadcrumb.selected_entities))
        }
    }

    renderBreadcrumbLink(button, breadcrumb, key, button_perms) {
        const { project_id } = this.props
        const label = (button.label && button.label(breadcrumb.selected_entities)) || ""
        if (button.type === "separator" ) {
            return <PopupPanelSeparator key={key} />
        } else if (button.type === "heading" ) {
            return <PopupPanelHeading key={key} >{label}</PopupPanelHeading>
        } else if ( button['dispatch_action'] || button['generic_action'] ) {
            return (
                <PermissionInspectorHighlighter key={key}
                                                project_id={project_id}
                                                permission_names={button_perms}>
                  { button.type === "button" &&
                  <PopupPanelButton>
                    <div onClick={() => this.onClickBreadcrumbActionButton(button)}>
                      {label}
                    </div>
                  </PopupPanelButton>
                  }
                  { button.type !== "button" &&
                    <PopupPanelLink>
                      <div onClick={() => this.onClickBreadcrumbActionButton(button)}>
                        {label}
                      </div>
                    </PopupPanelLink>
                  }
                </PermissionInspectorHighlighter>
            )
        } else {
            return (
                <PermissionInspectorHighlighter key={key}
                                                project_id={project_id}
                                                permission_names={button_perms}>
                  <PopupPanelLink>
                    <Link to={button['nav_url'](breadcrumb.selected_entities)}>
                      {label}
                    </Link>
                  </PopupPanelLink>
                </PermissionInspectorHighlighter>
            )
        }
    }

    renderGlobalObjects() {
        const { breadcrumb } = this.props
        return (
            <div>
              { breadcrumb.selected_entities && breadcrumb.selected_entities.sprint &&
                <SprintSnapshotSelector sprint_id={breadcrumb.selected_entities.sprint.id}/>
              }
            </div>
        )

    }
    
    render() {
        const {label, to, is_last, breadcrumb, permissions } = this.props
        const { show_breadcrumb_menu } = this.state
        const that = this

        const buttons = show_breadcrumb_menu && menu_buttons[breadcrumb.type]

        return (
            <BreadcrumbCell onMouseLeave={this.hideBreadCrumbMenu}>
              <Link to={to}
                    onMouseOver={this.showBreadCrumbMenu}>
                {label}
              </Link>
              { buttons && 
                <BreadcrumbMenuDiv>
                  <PopupPanel>
                    { map(buttons, function(button, index) {
                          const button_perms = (button.perms !== undefined && button.perms(breadcrumb.selected_entities)) || null
                          const can_view = button.perms === undefined || permissions === null ||
                                           filter(button_perms, (perm) => permissions[perm] === true).length>0
                          if ( ! can_view ) {
                              return null
                          }
                          return that.renderBreadcrumbLink(button, breadcrumb, index, button_perms)
                      })
                    }
                  </PopupPanel>
                </BreadcrumbMenuDiv>
              }
              { !is_last &&
                <BreadcrumbSeparator/>
              }
              { this.renderGlobalObjects() }
            </BreadcrumbCell>
        )
    }
}

function mapStateToProps(state, props) {
    const { breadcrumb } = props
    const project_id = get(breadcrumb, ["selected_entities", "project", "id"], null)
    const permissions = (project_id && logged_in_users_permissions(state, project_id)) || null
    const issues = state.item.issue.items_by_id
    
    return {
        label: breadcrumb.label,
        to: breadcrumb.to,
        issues: issues,
        project_id,
        breadcrumb,
        permissions
    }
}

export default withRouter(connect(mapStateToProps)(Breadcrumb))

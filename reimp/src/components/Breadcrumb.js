import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router'
import '../sass/breadcrumb.css'
import {browserHistory} from 'react-router'
import { map } from 'lodash'
import {
    startCandidateProject
} from '../actions/Projects.js'

const menu_buttons = {

    'projects': [
        { label: (objs) => '+ New Project',
          dispatch_action: startCandidateProject }
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
          nav_url: (objs) => '/projects/' + objs.project.id + '/gallery'
        },
        { label: (objs) => 'Wiki',
          nav_url: (objs) => '/projects/' + objs.project.id + '/wiki'
        },
        { label: (objs) => 'Users',
          nav_url: (objs) => '/projects/' + objs.project.id + '/users'
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
        const {show_breadcrumb_menu} = this.state
        this.setState({show_breadcrumb_menu:true})
    }

    hideBreadCrumbMenu() {
        const {show_breadcrumb_menu} = this.state
        this.setState({show_breadcrumb_menu:false})
    }

    onClickBreadcrumbActionButton(breadcrumb_button) {
        const { dispatch, breadcrumb } = this.props
        if ( breadcrumb_button['dispatch_action'] ) {
            dispatch(breadcrumb_button['dispatch_action']())
        } else {
            browserHistory.push(breadcrumb_button['nav_url'](breadcrumb.selected_entities))
        }
    }
    
    render() {
        const {label, to, is_last, breadcrumb } = this.props
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
                  { map(buttons, function(button, index) {
                        return (
                            <div key={index}
                                 className="breadcrumb-menu__item"
                                 onClick={() => that.onClickBreadcrumbActionButton(button)}>
                              {button.label(breadcrumb.selected_entities)}
                            </div>
                        )
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

    return {
        label: breadcrumb.label,
        to: breadcrumb.to,
        breadcrumb: breadcrumb
    }
}

export default connect(mapStateToProps)(withRouter(Breadcrumb))

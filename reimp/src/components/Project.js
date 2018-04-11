import React, { Component } from 'react'
import { DragSource, DropTarget } from 'react-dnd'
import {withRouter, Link} from 'react-router-dom'
import {get, includes, keys} from 'lodash'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { DndTypes } from '../actions/Dnd'
import { ENTITY_KEY__PROJECT, getCellStyle } from '../actions/ItemListKeyRegistry'
import '../sass/project.css'
import { deleteProjects, canShowProjectDelete } from '../actions/Projects'
import { getSelectedItems, setItemflag } from '../actions/ItemList'
import DeleteProject from '../components/DeleteProject'
import { has_permission } from '../actions/Users'
import Timestamp from './Timestamp'

class Project extends Component {

    constructor(props) {
        super(props)
        this.onDeleteProject = this.onDeleteProject.bind(this)
    }

    render_collapsed() {
	      const { project } = this.props
	      return (
	          <div key={this.key+".collapsed_project."+project.id}>
	              Project: {project.name}
	          </div>
	      )
    }

    onDeleteProject(event) {
        const { project, dispatch, onDelete } = this.props
        event.stopPropagation()
        if ( ! confirm( "Delete project " + project.name + "?") ) {
            return
        }
        dispatch(deleteProjects([project.id]))
        if ( onDelete ) {
            onDelete(project.id)
        }
    }    
    
    render_expanded() {
        const { project, is_loading, is_selected, isOver,
		onClickedProject, connectDragSource, connectDropTarget,
                visible_header_keys, header_list, can_show_project_delete } = this.props
	if ( ! project ) {
	    return (
                <div className="div-table__row">
                  <div className="div-table__cell">
                    Loading...
                  </div>
                </div>
            )
	}
	
	if ( ! is_loading === false ) {
	    return (
		<div key={this.key+"."+project.id}
		     onClick={onClickedProject}
                     className={classNames("div-table__row",
                                           {'div-table__row--selected':is_selected})}
		>
		  <div className="div-table__cell">{project && project.id}</div>
		  <div className="div-table__cell">Loading...</div>
		</div>
	    )
	} else {
            return (
		<div key={this.key+"."+project.id}
                     className={classNames('project',
                                           'div-table__row',
                                           {'div-table__row--selected': is_selected})}
		>
                  {includes(visible_header_keys, "name") &&
		   <div className="div-table__cell"
                        onClick={onClickedProject}
                        style={getCellStyle(header_list.name)}>
                     <div className="project__cell--name">
                       {project.name}
                     </div>
                   </div>
                  }

                   {includes(visible_header_keys, "active") &&
                    <div className="div-table__cell project__cell__secondary"
                         style={getCellStyle(header_list.active)}>
                      <div className={classNames("project-cell__active_status",
                                                 {"icon__status--active":get(project, ["recent_activity","is_active"], false),
                                                  "icon__status--inactive":get(project, ["recent_activity", "is_inactive"], false),
                                                  "icon__status--expired":get(project, ["recent_activity", "is_expired"], false)})}
                      >
                        
                      </div>
                    </div>
                   }
                    
                    {includes(visible_header_keys, "num_sprints") &&
                     <Link className="div-table__cell sprint__cell__secondary"
                           to={'/projects/'+project.id+'/sprints/'}
                           style={getCellStyle(header_list.num_sprints)}>
                       <div className="project__cell--num-sprints">
                         { project && project.num_open_sprints > 0 &&
                           <div>
                             {project.num_open_sprints} open sprint{project.num_open_sprints>1 && "s"}
                           </div>
                         }
                       </div>
                     </Link>
                    }

                     {includes(visible_header_keys, "created_at") &&
                      <div className="div-table__cell project__cell__secondary"
                           style={getCellStyle(header_list.created_at)}>
                        <div className="project-cell__created-at">
                          <Timestamp value={project.recent_activity.project_created_at} format="from_now"/>
                        </div>
                      </div>
                     }

                      
                      {includes(visible_header_keys, "sort_reason") &&
                       <div className="div-table__cell project__cell__secondary"
                            style={getCellStyle(header_list.sort_reason)}>
                         <div className="project-cell__sort-reason">
                           {project.recent_activity.sort_reason}
                         </div>
                       </div>
                      }



                {includes(visible_header_keys, "sort_date") &&
                 <div className="div-table__cell project__cell__secondary"
                      style={getCellStyle(header_list.sort_date)}>
                   <div className="project-cell__sort-date">
                     <Timestamp value={project.recent_activity.sort_date} format="from_now"/>
                   </div>
                 </div>
                }

                 
                  {includes(visible_header_keys, "delete") &&
                   <div className="div-table__cell issue__cell__secondary"
                        style={getCellStyle(header_list.delete)}>
                     <div className="reveal-on-hover--block issue__cell--issue-delete">
                       <DeleteProject
                           onDelete={this.onDeleteProject}
                       />
                     </div>
                   </div>
                  }

                   { includes(visible_header_keys, "small_delete") &&
                     <div className="div-table__cell project__cell__secondary"
                     style={getCellStyle(header_list.small_delete)}>
                     { can_show_project_delete &&
                       <div className={"reveal-on-hover--block"}>
                         <div className="project__small-delete-image"
                              onClick={this.onDeleteProject} />
                       </div>
                     }
                     </div>
                   }
                      
              
                        {includes(visible_header_keys, "delete") &&
                         <div className="div-table__cell issue__cell__secondary"
                              style={getCellStyle(header_list.delete)}>
                           <div className="reveal-on-hover--block issue__cell--issue-delete">
                             <DeleteProject onDelete={this.onDeleteProject} />
                           </div>
                         </div>
                        }

                         { includes(visible_header_keys, "small_delete") &&
                           <div className="div-table__cell project__cell__secondary"
                                style={getCellStyle(header_list.small_delete)}>
                             { can_show_project_delete &&
                               <div className={"reveal-on-hover--block"}>
                                 <div className="project__small-delete-image"
                                      onClick={this.onDeleteProject} />
                               </div>
                             }
                           </div>
                         }
		</div>
            )
	}
    }

    render() {
        const { is_collapsed, is_expanded } = this.props

	      if ( is_collapsed ) {
	          return this.render_collapsed()
	      }
	      else if ( is_expanded ) {
	          return this.render_expanded()
	      } else {
	          return ( <div>Dev error</div> )
	      }
    }
}

function mapStateToProps(state, props) {
    const { project } = state
    const { project_id, is_selected, is_collapsed, is_loading, header_list, onDelete, list_key } = props
    const this_project = (project && project.items_by_id && project.items_by_id[project_id]) || {}
    const selectedProjects = getSelectedItems(state, list_key, ENTITY_KEY__PROJECT) || []
    const can_show_project_delete = canShowProjectDelete(this_project) &&
                                    has_permission(state, project_id, 'has_delete_project')
    
    return {
        project: this_project,
        project_id: project_id,
        is_selected: is_selected,
        is_loading: is_loading,
        is_collapsed: is_collapsed,
        is_expanded: !is_collapsed,
        header_list,
        visible_header_keys: keys(header_list),
        onDelete: onDelete || null,
        can_show_project_delete: can_show_project_delete
    }
}

export default withRouter(connect(mapStateToProps)(Project))

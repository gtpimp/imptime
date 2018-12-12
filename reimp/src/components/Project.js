import React, { Component } from 'react'
import {withRouter} from 'react-router-dom'
import {get, includes, keys} from 'lodash'
import { connect } from 'react-redux'
import { getCellStyle } from '../actions/ItemListKeyRegistry'
import '../sass/project.css'
import { deleteProjects, canShowProjectDelete } from '../actions/Projects'
import DeleteProject from '../components/DeleteProject'
import { has_permission } from '../actions/Users'
import Timestamp from './Timestamp'
import DivTableRow from './DivTableRow'
import DivTableCell from './DivTableCell'
import DivTableLink from './DivTableLink'
import StatusCircle from './StatusCircle'

class Project extends Component {

    constructor(props) {
        super(props)
        this.onDeleteProject = this.onDeleteProject.bind(this)
        this.getProjectStatus = this.getProjectStatus.bind(this)
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
        if ( ! window.confirm( "Delete project " + project.name + "?") ) {
            return
        }
        dispatch(deleteProjects([project.id]))
        if ( onDelete ) {
            onDelete(project.id)
        }
    }    

    getProjectStatus(project) {
        var colour;
        if (get(project, ["recent_activity","is_active"], false)) colour = "green";
        if (get(project, ["recent_activity","is_inactive"], false)) colour = "orange";
        if (get(project, ["recent_activity","is_expired"], false)) colour = "gray";
        if (get(project, ["recent_activity","is_closed"], false)) colour = "red";
        return colour
    }

    
    render_expanded() {
        const { project, is_loading, is_selected,
		onClickedProject,
                visible_header_keys, header_list, can_show_project_delete } = this.props
	if ( ! project ) {
	    return (
                <DivTableRow>
                  <DivTableCell>
                    Loading...
                  </DivTableCell>
                </DivTableRow>
            )
	}
	
	if ( ! is_loading === false ) {
	    return (
		<DivTableRow key={this.key+"."+project.id}
		             onClick={onClickedProject}
                             is_selected={is_selected}
		>
		  <div className="div-table__cell">{project && project.id}</div>
		  <div className="div-table__cell">Loading...</div>
		</DivTableRow>
	    )
	} else {
            return (
		<DivTableRow key={this.key+"."+project.id}
                             is_selected={is_selected}>
                  {includes(visible_header_keys, "name") &&
		   <DivTableCell
                       onClick={onClickedProject}
                       extra_style={getCellStyle(header_list.name)}>
                     {project.name}
                   </DivTableCell>
                  }

                   {includes(visible_header_keys, "active") &&
                    <DivTableCell extra_style={getCellStyle(header_list.active)}>
                      <StatusCircle colour={ this.getProjectStatus(project) } />
                    </DivTableCell>
                   }
                    
                    {includes(visible_header_keys, "num_sprints") &&
                     <DivTableCell secondary={true} extra_style={getCellStyle(header_list.num_sprints)}>
                       <DivTableLink to={'/projects/'+project.id+'/sprints/'}
                                     extra_style={getCellStyle(header_list.num_sprints)}>
                         { project && project.num_open_sprints > 0 &&
                           <div>
                             {project.num_open_sprints} open sprint{project.num_open_sprints>1 && "s"}
                           </div>
                         }
                       </DivTableLink>
                     </DivTableCell>
                    }

                     {includes(visible_header_keys, "created_at") &&
                      <DivTableCell secondary={true} extra_style={getCellStyle(header_list.created_at)}>
                        <div className="project-cell__created-at">
                          <Timestamp
                              value={project.recent_activity && project.recent_activity.project_created_at}
                              format="from_now"/>
                        </div>
                      </DivTableCell>
                     }

                      
                      {includes(visible_header_keys, "sort_reason") &&
                       <DivTableCell secondary={true} extra_style={getCellStyle(header_list.sort_reason)}>
                         <div className="project-cell__sort-reason">
                           {project.recent_activity && project.recent_activity.sort_reason}
                         </div>
                       </DivTableCell>
                      }



                       {includes(visible_header_keys, "sort_date") &&
                        <DivTableCell secondary={true} extra_style={getCellStyle(header_list.sort_date)}>
                          <div className="project-cell__sort-date">
                            <Timestamp
                                value={project.recent_activity && project.recent_activity.sort_date}
                                format="from_now"/>
                          </div>
                        </DivTableCell>
                       }

                        
                        {includes(visible_header_keys, "delete") &&
                         <DivTableCell secondary={true} extra_style={getCellStyle(header_list.delete)}>
                           <div className="reveal-on-hover--block issue__cell--issue-delete">
                             <DeleteProject
                                 onDelete={this.onDeleteProject}
                             />
                           </div>
                         </DivTableCell>
                        }

                         { includes(visible_header_keys, "small_delete") &&
                           <DivTableCell secondary={true} extra_style={getCellStyle(header_list.small_delete)}>
                             { can_show_project_delete &&
                               <div className={"reveal-on-hover--block"}>
                                 <div className="project__small-delete-image"
                                      onClick={this.onDeleteProject} />
                               </div>
                             }
                           </DivTableCell>
                         }
                           
		</DivTableRow>
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
    const { project_id, is_selected, is_collapsed, is_loading, header_list, onDelete } = props
    const this_project = (project && project.items_by_id && project.items_by_id[project_id]) || {}
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

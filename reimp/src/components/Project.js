import React, { Component } from 'react'
import { DragSource, DropTarget } from 'react-dnd'
import {includes, keys} from 'lodash'
import {browserHistory} from 'react-router'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { DndTypes } from '../actions/Dnd'
import { ENTITY_KEY__PROJECT, getCellStyle } from '../actions/ItemListKeyRegistry'
import '../sass/project.css'
import { deleteProjects } from '../actions/Projects'
import DeleteProject from '../components/DeleteProject'

class Project extends Component {

    constructor(props) {
        super(props)
        this.onSprintsClick = this.onSprintsClick.bind(this)
        this.onDeleteProject = this.onDeleteProject.bind(this)
    }
    
    onSprintsClick(event) {
        const { project_id } = this.props
        event.stopPropagation()
        browserHistory.push('/projects/'+project_id+'/sprints/');
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
                visible_header_keys, header_list } = this.props

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
		                 onClick={onClickedProject}
                     className={classNames('project',
                                           'div-table__row',
                                           {'div-table__row--selected': is_selected})}
		            >
                  {includes(visible_header_keys, "name") &&
		               <div className="div-table__cell"
                        style={getCellStyle(header_list.name)}>
                     <div className="project__cell--name">
                       {project.name}
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "num_sprints") &&
                   <div className="div-table__cell sprint__cell__secondary"
                        onClick={this.onSprintsClick}
                        style={getCellStyle(header_list.num_sprints)}>
                     <div className="project__cell--num-sprints">
                       { project.num_open_sprints > 0 &&
                         <div>
                           {project.num_open_sprints} open sprint{project.num_open_sprints>1 && "s"}
                         </div>
                       }
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "small_delete") &&
                  <div className="div-table__cell project__cell__secondary"
                       style={getCellStyle(header_list.small_delete)}>
                    <div className={"reveal-on-hover--block"}>
                      <div className="project__small-delete-image" onClick={this.onDeleteProject} />
                    </div>
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
    const { project_id, is_selected, is_collapsed, is_loading, header_list, onDelete } = props
    const this_project = (project && project.items_by_id && project.items_by_id[project_id]) || {}
    
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
    }
}

export default connect(mapStateToProps)(Project)

/* import React, {Component} from 'react'
 * import {connect} from 'react-redux'
 * import TextComponent from './TextComponent'
 * import { isEditing, isReadonly } from '../actions/EditableProperty'
 * 
 * class IssueTitle extends EditableProperty {
 * 
 *     handleChange(e) {
 *         console.log('Changed value to: ', e.target.value)
 *     }
 * 
 *     renderView(issue) {
 *         return (
 *             <div className="issue-title issue-title--readonly">{issue.title}</div>
 *         )
 *     }
 * 
 *     renderEmptyState() {
 *         return (
 *             <div className="issue-title issue-title--empty">Title</div>
 *         )
 *     }
 * 
 *     renderEdit(issue) {
 *         return (
 *             <TextComponent placeholder="Title" onChange={ this.handleChange }/>
 *         )
 *     }
 * 
 *     render() {
 *         const {issue, is_readonly, is_editable, is_empty_state} = this.props
 * 
 * 	      const that = this
 * 	      let editing_child = null
 * 	      let readonly_child = null
 *         let empty_child = null
 * 
 * 	      React.Children.map(children, function(child, index) {
 * 	          if ( index === 0 ) {
 * 		            editing_child = React.cloneElement(child, {
 * 		                value: value
 * 		            })
 * 	          } else if ( index === 1 ) {
 * 		            readonly_child = React.cloneElement(child, {
 * 		                value: value
 * 		            })
 * 	          } else if ( index === 2 ) {
 *                 empty_child = React.cloneElement(child)
 *             }
 * 	      })
 * 	      if ( ! readonly_child ) {
 * 	          readonly_child = editing_child
 * 	      }
 *         if ( ! empty_child ) {
 *             empty_child = readonly_child
 *         }
 *         
 *         return (
 *             <div>
 *                 ( is_readonly && 
 *                 { mode === 'view-value' &&
 *                 this.renderView(issue)
 *                 }
 *                 { mode === 'view-empty-state' &&
 *                 this.renderEmptyState()
 *                 }
 *                 { mode === 'edit' &&
 *                 this.renderEdit(issue)
 *                 }
 *             </div>
 *         )
 *     }
 * }
 * 
 * function mapStateToProps(state, props) {
 * 
 *     const { property_key } = this.props
 *     
 *     return {
 *         property_key: property_key,
 *         is_editing: isEditing(state, property_key),
 *         is_readonly: isReadonly(state, property_key),
 *         is_empty: isEmpty(state, property_key)
 *     }
 * }
 * 
 * 
 * export default connect(mapStateToProps)(IssueTitle)*/

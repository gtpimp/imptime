import React, {Component} from 'react'
import { connect } from 'react-redux'
import {withRouter} from 'react-router-dom'
import { map } from 'lodash'
import {
    getVisibleItemIds,
    getVisibleItems,
    isLoading,
    getLoadingItemIds,
    update_list_filter,
    getListFilter
} from '../../actions/ItemList'
import {
    fetchSprintsIfNeeded
} from '../../actions/Sprints'
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
} from 'recharts'

import SimplifiedLoading from './SimplifiedLoading'
import SimplifiedTitle from './SimplifiedTitle'
import SimplifiedSubTitle from './SimplifiedSubTitle'
import SimplifiedParagraph from './SimplifiedParagraph'
import { ENTITY_KEY__SPRINT } from '../../actions/ItemListKeyRegistry'
import { css, cx } from 'emotion'
import { default_theme as theme } from '../../theme/default'
import { mobile_styles } from '../css/style.js';

class SimplifiedSprintList extends Component {

    componentDidMount() {
        const { dispatch, list_key, project_id, filter } = this.props
        dispatch(update_list_filter(list_key, {project_id: project_id,
                                               sprint_status: 'open'}))
        if ( filter.project_id ) {
            dispatch(fetchSprintsIfNeeded(list_key))
        }
    }
    
    componentDidUpdate(old_props) {
        const { dispatch, list_key, project_id, filter } = this.props
        if ( filter.project_id !== project_id ) {
            dispatch(update_list_filter(list_key, {project_id: project_id}))
        }
        if ( filter.project_id ) {
            dispatch(fetchSprintsIfNeeded(list_key))
        }
    }

    onSelectSprint(evt, sprint) {
        const { history, project_id } = this.props
        evt.preventDefault()
        history.push(`/wd/projects/${project_id}/sprints/${sprint.id}/`)
    }

    renderSprintProgressBar = (sprint) => {

        const graph_data = [ {
              // num_dev_closed_issues: 10,
              // num_completely_closed_issues: 20
              name: 'progress',
              num_dev_closed_issues: sprint.num_dev_closed_issues,
              num_completely_closed_issues: sprint.num_completely_closed_issues } ]

        return (
            <ResponsiveContainer>
              <BarChart data={graph_data}
                        margin={{top: 0, right: 0, left: 0, bottom: 0}}
                        layout="vertical">
                <XAxis type="number" hide={ true } />
                <YAxis dataKey="name" type="category" hide={ true } />
                <Bar
                    isAnimationActive={ true }
                    dataKey="num_dev_closed_issues"
                    stackId="a"
                    fill="#249134" />
                <Bar
                    isAnimationActive={ false }
                    dataKey="num_completely_closed_issues"
                    stackId="a"
                    fill="#e6e6e6" />
              </BarChart>
            </ResponsiveContainer>
        )
    }

    renderSprint(sprint) {
        return (
            
            <div key={sprint.id}
                 className={ mobile_styles.mini_section }
                 onClick={(evt) => this.onSelectSprint(evt, sprint)}>

                <div className={ mobile_styles.summary_header }>
                  <div className={ mobile_styles.title_row }>
                    <span className={ mobile_styles.card_title }>{sprint.number} {sprint.name}</span>
                  </div>
                  <div className={ mobile_styles.status_row }>
                    <span className={ mobile_styles.status_text}>{ sprint.status_name }</span>
                  </div>

                  { sprint.description && 
                    <span>{sprint.description}</span>
                  }
                </div>

              { sprint.num_dev_closed_issues > 0 && sprint.num_completely_closed_issues > 0 && 
                <SimplifiedParagraph>
                  <div className={ mobile_styles.bar_content }>
                    <div className={ mobile_styles.bar_container }>
                      { this.renderSprintProgressBar(sprint) }
                    </div>
                  </div>
                </SimplifiedParagraph>
              }
            </div>
        )
    }
    
    render() {
        const { sprints, is_loading } = this.props

        if ( is_loading ) {
            return <SimplifiedLoading/>
        }
        
        return (
            <div>
              { map(sprints, (sprint) => this.renderSprint(sprint) )}
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { list_key, project_id } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__SPRINT)
    const loading_item_ids = getLoadingItemIds(state, list_key)
    const is_loading = isLoading(state, list_key)
    const filter = getListFilter(state, list_key)
    
    return {
        list_key: list_key,
        project_id: project_id,
        visible_item_ids,
        sprints: visible_items,
        sprint_ids: visible_item_ids,
        loading_item_ids,
        filter,
        is_loading
    }
}

export default withRouter(connect(mapStateToProps)(SimplifiedSprintList))

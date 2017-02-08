import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import '../sass/search-box.css'
import {initFilter, runFilter, getFilter} from '../actions/Filter'
import { FILTER_KEY__GLOBAL } from '../actions/ItemListKeyRegistry'
import ReactTimeout from 'react-timeout'

class SearchBox extends Component {

    constructor(props) {
        super(props)
        this.onFilter = this.onFilter.bind(this)
        this.onFilterTermChanged = this.onFilterTermChanged.bind(this)

        this.filter_timeout_id = null
    }

    componentDidMount() {
        const { dispatch, filter_key } = this.props
        dispatch(initFilter(filter_key))
    }

    onFilterTermChanged() {
        const {dispatch, filter_key, setTimeout} = this.props
        const value = this.filter_term_el.value
        const that = this
        
        if ( this.filter_timeout_id != null ) {
            clearTimeout(this.filter_timeout_id)
            this.filter_timeout_id = null
        }
        this.filter_timeout_id = setTimeout(function() { that.onFilter(value) }, 500)
    }

    onFilter(value) {
        const {dispatch, filter_key} = this.props
        dispatch(runFilter(filter_key, value))
    }

    renderIssueResults(name, issue_results) {
        return (
            <div className="search-box__issue_results">
                <h2>{name}</h2>
                {map(issue_results, function(issue_result) {
                     return (
                         <div className="search-box__search-result">
                             <div>{issue_result.number}</div>
                             <div>{issue_result.subject}</div>
                             <div>{issue_result.status_name}</div>
                             <div>{issue_result.project_name}</div>
                             <hr/>
                         </div>
                     )
                 }
                 )}
            </div>
        )
    }

    renderSprintResults(name, sprint_results) {
        return (
            <div className="search-box__sprint_results">
                <h2>{name}</h2>
                {map(sprint_results, function(sprint_result) {
                     return (
                         <div className="search-box__search-result">
                             <div>{sprint_result.number}</div>
                             <div>{sprint_result.name}</div>
                             <div>{sprint_result.status_name}</div>
                             <div>{sprint_result.project_name}</div>
                             <hr/>
                         </div>
                     )
                 }
                 )}
            </div>
        )
    }

    renderProjectResults(name, project_results) {
        return (
            <div className="search-box__project_results">
                <h2>{name}</h2>
                {map(project_results, function(project_result) {
                     return (
                         <div className="search-box__search-result">
                             <div>{project_result.name}</div>
                             <hr/>
                         </div>
                     )
                 }
                 )}
            </div>
        )        
    }
    
    renderResults(results) {
        return (
            <div className="search-box__results_by_category">
                { results.sprints_within_active_projects.length > 0 && this.renderSprintResults("Sprint results within active projects", results.sprints_within_active_projects) }
                { results.issues_within_active_sprints.length > 0 && this.renderIssueResults("Issue results within active sprints", results.issues_within_active_sprints) }
                { results.issues_within_active_issues.length > 0 && this.renderIssueResults("Issue results within active issues", results.issues_within_active_issues) }
                { results.all_issues.length > 0 && this.renderIssueResults("Other issues", results.all_issues) }
                { results.all_projects.length > 0 && this.renderProjectResults("Other projects", results.all_projects) }
                { results.all_sprints.length > 0 && this.renderSprintResults("Other sprints", results.all_sprints) }
            </div>
        )
    }

    render() {

        const { is_loading, results } = this.props

        return (
            <div className="search-box">
                <div className="search-box__component search-box__icon"><i className="material-icons">search</i></div>
                <input ref={(ref) => this.filter_term_el = ref} className="search-box__textfield" type="text" placeholder="Search Imptime" onChange={this.onFilterTermChanged}/>
                <div className="search-box__component search-box__icon"><i className="material-icons">arrow_drop_down</i></div>

                { is_loading &&
                  <div className="search-box__search-results--loading">
                      <div>Loading...</div>
                  </div>
                }

                { results && 
                  <div className="search-box__search-results--loaded">
                      { this.renderResults(results) }
                  </div>
                }
                
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const filter_key = FILTER_KEY__GLOBAL
    const filter = getFilter(state, filter_key)

    const results = filter.results
    const term = filter.term || null

    return {
        filter_key: filter_key,
        results: results,
        term: term,
        is_loading: results && results.is_loading
    }
}

export default connect(mapStateToProps)(ReactTimeout(SearchBox))

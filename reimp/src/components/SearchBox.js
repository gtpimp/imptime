import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import '../sass/search-box.css'
import {withRouter} from 'react-router-dom'
import {initFilter, runFilter, getFilter, hideResults, showResults, clearResults} from '../actions/Filter'
import {FILTER_KEY__GLOBAL} from '../actions/ItemListKeyRegistry'
import ReactTimeout from 'react-timeout'
import SearchInput from './SearchInput'
import styled from 'react-emotion'

const SearchBoxDiv = styled('div')(props => ({"height": "28px",
                                              "paddingLeft": "12px"}))


class SearchBox extends Component {

    constructor(props) {
        super(props)
        this.onFilter = this.onFilter.bind(this)
        this.onFilterTermChanged = this.onFilterTermChanged.bind(this)
        this.filter_timeout_id = null
        this.onClickIssueResult = this.onClickIssueResult.bind(this)
        this.onClickSprintResult = this.onClickSprintResult.bind(this)
        this.onClickProjectResult = this.onClickProjectResult.bind(this)
        this.onShowResults = this.onShowResults.bind(this)
        this.onHideResults = this.onHideResults.bind(this)
        this.keyDown = this.keyDown.bind(this)
    }

    componentDidMount() {
        const {dispatch, filter_key} = this.props
        dispatch(initFilter(filter_key))
    }

    onFilterTermChanged(evt) {
        const {dispatch, filter_key, setTimeout} = this.props
        const value = evt.target.value
        const that = this

        dispatch(clearResults(filter_key))

        if (this.filter_timeout_id != null) {
            clearTimeout(this.filter_timeout_id)
            this.filter_timeout_id = null
        }
        this.filter_timeout_id = setTimeout(function () {
            that.onFilter(value)
        }, 500)
    }

    onFilter(value) {
        const {dispatch, filter_key} = this.props
        dispatch(runFilter(filter_key, value))
        dispatch(showResults(filter_key))
    }

    onHideResults() {
        const {dispatch, filter_key} = this.props
        dispatch(hideResults(filter_key))
    }

    onShowResults() {
        const {dispatch, filter_key} = this.props
        dispatch(showResults(filter_key))
    }

    keyDown(event) {
        if (event.keyCode === 27) {
            event.preventDefault()
            this.onHideResults()
        }
    }

    onClickProjectResult(res) {
        const { history } = this.props
        history.push('/projects/' + res.project_id + '/sprints');
        this.onHideResults()
    }

    onClickSprintResult(res) {
        const { history } = this.props
        history.push('/projects/' + res.project_id + '/sprints/' + res.sprint_id + '/issues');
        this.onHideResults()
    }

    onClickIssueResult(res) {
        const { history } = this.props
        history.push('/projects/' + res.project_id + '/sprints/' + res.sprint_id + '/issues/' + res.issue_id);
        this.onHideResults()
    }

    renderIssueResults(name, issue_results) {
        const that = this
        return (
            <div className="search-box__issue_results">
              <h2>{name}</h2>
              {map(issue_results, function (issue_result, index) {
                   return (
                       <div key={index} className="search-box__search-result" onClick={() => that.onClickIssueResult(issue_result) }>
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
        const that = this
        return (
            <div className="search-box__sprint_results">
              <h2>{name}</h2>
              {map(sprint_results, function (sprint_result, index) {
                   return (
                       <div key={index} className="search-box__search-result" onClick={() => that.onClickSprintResult(sprint_result) }>
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
        const that = this
        return (
            <div className="search-box__project_results">
              <h2>{name}</h2>
              {map(project_results, function (project_result, index) {
                   return (
                       <div key={index} className="search-box__search-result" onClick={() => that.onClickProjectResult(project_result) }>
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
            <div className="search-box__results_by_category" onKeyDown={this.keyDown}>
              { results.sprints_within_active_projects.length > 0 && this.renderSprintResults("Sprint results within active projects", results.sprints_within_active_projects) }
              { results.issues_within_active_sprints.length > 0 && this.renderIssueResults("Issue results within active sprints", results.issues_within_active_sprints) }
              { results.issues_within_active_issues.length > 0 && this.renderIssueResults("Issue results within active issues", results.issues_within_active_issues) }
              { results.all_issues.length > 0 && this.renderIssueResults("Other issues", results.all_issues) }
              { results.all_projects.length > 0 && this.renderProjectResults("Other projects", results.all_projects) }
              { results.all_sprints.length > 0 && this.renderSprintResults("Other sprints", results.all_sprints) }

              { results.sprints_within_active_projects.length === 0 &&
                results.issues_within_active_sprints.length === 0 &&
                results.issues_within_active_issues.length === 0 &&
                results.all_issues.length === 0 &&
                results.all_projects.length === 0 &&
                results.all_sprints.length === 0 &&
                <div className="search-box__no-results">
                  No results
                </div>
              }
                
                
                
            </div>
        )
    }

    render() {

        const {is_loading, results, show_results} = this.props

        return (
            <SearchBoxDiv onKeyDown={this.keyDown}>
              <SearchInput placeholder="Search Imptime"
                           onOpenDropDown={this.onShowResults}
                           onChange={this.onFilterTermChanged}/>

              { is_loading &&
                <div className="search-box__search-results--loading">
                  <div>Loading...</div>
                </div>
              }

              { show_results && results &&
                <div className="search-box__search-results--loaded">
                  <button className="button button--primary search-box__close" onClick={this.onHideResults}>Close</button>
                  { this.renderResults(results) }
                </div>
              }
            </SearchBoxDiv>
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
        show_results: filter.is_visible,
        term: term,
        is_loading: results && results.is_loading
    }
}

export default withRouter(connect(mapStateToProps)(ReactTimeout(SearchBox)))

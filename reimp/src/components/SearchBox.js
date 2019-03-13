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
import ModalDialog from './ModalDialog'
import PopupPanelHeading from './PopupPanelHeading'
import PopupPanelLink from './PopupPanelLink'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

const SearchBoxDiv = styled('div')(props => ({"height": "28px",
                                              "paddingLeft": "12px"}))

const search_result_row = css`padding-bottom: 18px;
                              cursor: pointer;
                              display: flex;
                              &:hover {
                                background-color: ${theme.colours.list_rollover};
                              }`

const search_result_field = css`font: ${theme.fonts.informational};
                                padding-left: 10px;
                                min-width: 15%;
                                max-width: 15%`

const search_result_field_primary = css`font: ${theme.fonts.informational};
                                        width: 50%;
                                        padding-left: 10px;`

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
              <PopupPanelHeading>{name}</PopupPanelHeading>
              {map(issue_results, function (issue_result, index) {
                   return (
                       <PopupPanelLink key={index}
                                       onClick={() => that.onClickIssueResult(issue_result)}>
                         <div className={search_result_row}>
                           <div className={search_result_field}>{issue_result.number}</div>
                           <div className={search_result_field_primary}>{issue_result.subject}</div>
                           <div className={search_result_field}>{issue_result.status_name}</div>
                           <div className={search_result_field}>{issue_result.sprint_name}</div>
                           <div className={search_result_field}>{issue_result.project_name}</div>
                         </div>
                       </PopupPanelLink>
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
              <PopupPanelHeading>{name}</PopupPanelHeading>
              {map(sprint_results, function (sprint_result, index) {
                   return (
                       <PopupPanelLink key={index}
                            className={search_result_row}
                                       onClick={() => that.onClickSprintResult(sprint_result) }>
                         <div className={search_result_row}>
                           <div className={search_result_field}>{sprint_result.number}</div>
                           <div className={search_result_field_primary}>{sprint_result.name}</div>
                           <div className={search_result_field}>{sprint_result.status_name}</div>
                           <div className={search_result_field}>{sprint_result.project_name}</div>
                         </div>
                       </PopupPanelLink>
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
              <PopupPanelHeading>{name}</PopupPanelHeading>
              {map(project_results, function (project_result, index) {
                   return (
                       <PopupPanelLink key={index}
                                       className={search_result_row}
                                       onClick={() => that.onClickProjectResult(project_result) }>
                         <div className={search_result_row}>
                           <div className={search_result_field_primary}>{project_result.name}</div>
                         </div>
                       </PopupPanelLink>
                   )
               }
               )}
            </div>
        )
    }

    renderResults(results) {
        return (
            <div className="search-box__results_by_category" onKeyDown={this.keyDown}>

              { results.sprints_within_selected_projects.length > 0 && this.renderSprintResults("Sprint results within active projects", results.sprints_within_selected_projects) }
              { results.issues_within_selected_sprints.length > 0 && this.renderIssueResults("Issue results within active sprints", results.issues_within_selected_sprints) }
              { results.issues_within_selected_issues.length > 0 && this.renderIssueResults("Issue results within active issues", results.issues_within_selected_issues) }
              
              { results.all_projects.length > 0 && this.renderProjectResults("Projects", results.all_projects) }
              { results.all_sprints.length > 0 && this.renderSprintResults("Sprints", results.all_sprints) }
              { results.all_issues.length > 0 && this.renderIssueResults("Issues", results.all_issues) }
              

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
              <SearchInput placeholder="Search ImpTime"
                           onOpenDropDown={this.onShowResults}
                           onChange={this.onFilterTermChanged}/>

              { is_loading &&
                <div className="search-box__search-results--loading">
                  <div>Loading...</div>
                </div>
              }

            { show_results && results &&
              <ModalDialog variant="large"
                           isOpen={show_results}
                           onClose={this.onHideResults}
                           title="Search results">
                { this.renderResults(results) }
              </ModalDialog>
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

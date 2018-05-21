import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import {
    initList,
    shouldFetchList,
    getVisibleItemIds,
    getNestedObjects,
    ensureNestedObjectsLoaded,
    isLoading,
    getLastUpdated,
    update_list_pagination
} from '../actions/ItemList'
import { ENTITY_KEY__COMPANY_PROBLEM } from '../actions/ItemListKeyRegistry'
import {
    fetchCompanyProblemsIfNeeded
} from '../actions/CompanyProblems'
import { isLoadingItems, areAnyItemsInvalidated } from '../actions/Item'
import CompanyProblem from './CompanyProblem'
import DivTable from './DivTable'

class CompanyProblemList extends Component {
    
    componentDidMount() {
	const { dispatch, list_key, nested_objects } = this.props
	dispatch(initList(list_key))
        dispatch(update_list_pagination(list_key, { 'page_size': 50 }))
        dispatch(fetchCompanyProblemsIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, list_key, nested_objects } = new_props
        dispatch(fetchCompanyProblemsIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    render() {

        const { company_problem_ids, is_loading } = this.props

        if ( (is_loading && !company_problem_ids && company_problem_ids.length) === 0 ) {
            return (
                <div>Loading...</div>
            )
        }

        return (

            <DivTable renderHeader={this.renderHeader}>
              {projects.map((project, index) => this.renderExpandedProject(project, index))}
            </DivTable>
            
            <div className="company_problem-list">
              { map(company_problem_ids, (company_problem_id) =>  <CompanyProblem key={company_problem_id} company_problem_id={company_problem_id} />) }
              { (!company_problem_ids || company_problem_ids.length) === 0 &&
                (
                    <div className="company_problem-list__empty">
                      { ! is_loading && "No company problems" }
                      { is_loading && "Loading..." }
                    </div>
                )
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { list_key } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const is_loading = isLoading(state, list_key) || isLoadingItems(state, ENTITY_KEY__COMPANY_PROBLEM, visible_item_ids)
    const last_updated = getLastUpdated(state, list_key)
    const nested_objects = getNestedObjects(state, list_key)
    const should_fetch_list = shouldFetchList(state, list_key)
    const is_invalidated = areAnyItemsInvalidated(state, ENTITY_KEY__COMPANY_PROBLEM, visible_item_ids)

    return {
        company_problem_ids: visible_item_ids,
        is_loading,
        is_invalidated,
        should_fetch_list,
        last_updated,
        nested_objects
    }
}

export default connect(mapStateToProps)(CompanyProblemList)

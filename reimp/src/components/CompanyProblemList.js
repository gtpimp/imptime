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
    update_list_pagination,
    invalidateList
} from '../actions/ItemList'
import { ENTITY_KEY__COMPANY_PROBLEM } from '../actions/ItemListKeyRegistry'
import {
    fetchCompanyProblemsIfNeeded
} from '../actions/CompanyProblems'
import { isLoadingItems, areAnyItemsInvalidated } from '../actions/Item'
import CompanyProblem from './CompanyProblem'
import DivTable from './DivTable'
import Pagination from './Pagination'

class CompanyProblemList extends Component {

    constructor(props) {
        super(props)
        this.onChangePage = this.onChangePage.bind(this)
    }
    
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

    onChangePage() {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(fetchCompanyProblemsIfNeeded(list_key))
    }

    render() {

        const { company_problem_ids, is_loading, header_list, list_key } = this.props

        if ( is_loading ) {
            return (
                <div>Loading...</div>
            )
        }

        if ( !company_problem_ids || company_problem_ids.length === 0 ) {
            return (
                <div className="company_problem-list__empty">
                  { ! is_loading && "No company problems" }
                </div>
            )
        }

        return (
            <div>
              <Pagination list_key={list_key}
                          on_changed={this.onChangePage} />
              <DivTable header_list={header_list}>
                {map(company_problem_ids, (company_problem_id, index) =>
                    <CompanyProblem key={index}
                                    company_problem_id={company_problem_id}
                                    header_list={header_list}/>)}
              </DivTable>
              <Pagination list_key={list_key}
                          on_changed={this.onChangePage} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { list_key, header_list } = props
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
        nested_objects,
        header_list
    }
}

export default connect(mapStateToProps)(CompanyProblemList)

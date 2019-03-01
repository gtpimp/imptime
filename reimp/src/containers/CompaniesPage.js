import React, {Component} from 'react'
import {connect} from 'react-redux'
import {get} from 'lodash'
import {withRouter} from 'react-router-dom'
import CompanyList from '../components/CompanyList'
import CompanySidebar from '../components/CompanySidebar'
import NewCompanySidebar from '../components/NewCompanySidebar'
import MultipleCompanySidebar from '../components/MultipleCompanySidebar'
import { setCompanyBreadcrumbsHelper } from '../actions/Breadcrumbs'
import {
    LIST_KEY__COMPANY_LIST,
    PAGE_KEY__COMPANIES_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    setPageSelectedEntities,
    getPageSelectedEntities
} from '../actions/Page'
import {
    initList,
    selectItems,
    update_list_pagination,
    getListFilter,
    getVisibleItemIds
} from '../actions/ItemList'
import {getCandidateCompany, getCompaniesById, fetchCompaniesIfNeeded} from '../actions/Companies'
import Splitter from '../components/Splitter'

class CompaniesPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectCompanies = this.onSelectCompanies.bind(this)
    }

    componentDidMount() {
        const {dispatch, default_company_id, list_key} = this.props
        dispatch(set_toolbars(PAGE_KEY__COMPANIES_PAGE, ['companies'], "Company list"))
        dispatch(initList(list_key))        
        dispatch(update_list_pagination(list_key, {page_size:20}))
        if ( default_company_id !== undefined ) {
            dispatch(selectItems(list_key, [default_company_id]))
            dispatch(setPageSelectedEntities(PAGE_KEY__COMPANIES_PAGE,
                                     {company_ids: [default_company_id]}))
        }
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.selected_company_ids.length !== this.props.selected_company_ids.length ||
             (new_props.selected_company_ids.length > 0 &&
              new_props.selected_company_ids[0] !== this.props.selected_company_ids[0]) ||
              get(new_props, ["selected_company", "name"], false) !== get(this.props, ["selected_company", "name"], false) ) {
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, selected_companies, list_key } = props
        dispatch(fetchCompaniesIfNeeded(list_key))
        let selected_company = null
        if ( selected_companies && selected_companies.length === 1 ) {
            selected_company = selected_companies[0]
        }
        dispatch(setCompanyBreadcrumbsHelper(selected_company))
    }

    onSelectCompanies(company_ids) {
        const { dispatch, history, list_key } = this.props
        dispatch(selectItems(list_key, company_ids))
        dispatch(setPageSelectedEntities(PAGE_KEY__COMPANIES_PAGE,
                                 {company_ids: company_ids}))
        if ( company_ids && company_ids.length === 1 ) {
            history.push('/companies/' + company_ids[0]);
        }
    }

    renderLeftPane() {
        const { list_key } = this.props
        return (
            <CompanyList key="companies"
                         list_key={list_key}
                         onSelectCompanies={this.onSelectCompanies} />
        )
    }

    renderRightPane() {
        const {selected_company_ids,
               is_single_selection, is_multiple_selection, is_creating_company,
               selected_company} = this.props

        if ( is_creating_company ) {
            return (
                <div className="list-layout__sidebar">
                  <NewCompanySidebar />
                </div>
            )
        }
        if ( ! is_creating_company && is_single_selection && selected_company ) {
            return (
                <div className="list-layout__sidebar">
                  <CompanySidebar company_id={selected_company.id}/>
                </div>
            )
        }
        if (! is_creating_company && is_multiple_selection && selected_company_ids ) {
            return (
                <div className="list-layout__sidebar">
                  <MultipleCompanySidebar company_ids={selected_company_ids}/>
                </div>
            )
        }
        
    }
    
    render() {

        const {show_sidebar} = this.props

        if ( show_sidebar ) {
            return (
                <Splitter name='companies_page'>
                  {this.renderLeftPane()}
                  {this.renderRightPane()}
                </Splitter>
            )
        }

        if ( ! show_sidebar ) {
            return (
                <Splitter>
                  {this.renderLeftPane()}
                  {null}
                </Splitter>
            )
        }
    }
}

function mapStateToProps(state, props) {
    const list_key = LIST_KEY__COMPANY_LIST
    const filter = getListFilter(state, list_key)
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const items_by_id = getCompaniesById(state, visible_item_ids)
    const selected_company_ids = getPageSelectedEntities(state, PAGE_KEY__COMPANIES_PAGE).company_ids
    const default_company_id = props.match.params.companyId

    const selected_items = items_by_id && selected_company_ids && selected_company_ids.map(function (selected_id, index) {
        return items_by_id[selected_id] || {'id': selected_id,
                                            'loaded': false }
    })

    const candidate_company = getCandidateCompany(state) || null
    const is_creating_company = candidate_company || false
    const selected_company = ( selected_items && selected_items.length > 0 && selected_items[0] ) || null
    const show_sidebar = (is_creating_company || (selected_company && selected_company.id)) || false
    
    return {
        selected_companies: selected_items,
        selected_company_ids: selected_company_ids,
        is_single_selection: selected_items && selected_items.length === 1,
        is_multiple_selection: selected_items && selected_items.length > 1,
        is_creating_company: is_creating_company,
        default_company_id,
        selected_company,
        show_sidebar,
        filter,
        list_key
    }
}

export default withRouter(connect(mapStateToProps)(CompaniesPage))


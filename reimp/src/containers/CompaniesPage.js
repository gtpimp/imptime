import React, {Component} from 'react'
import {connect} from 'react-redux'
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
    select_companies,
    get_selected_company_ids
} from '../actions/Page'
import {
    initList,
    selectItems,
    update_list_pagination,
} from '../actions/ItemList'
import {getCandidateCompany} from '../actions/Companies'
import { setActivelyAvailableAutoClockEntity } from '../actions/AutoClock'
import Splitter from '../components/Splitter'

class CompaniesPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectCompanies = this.onSelectCompanies.bind(this)
    }

    componentDidMount() {
        const {dispatch, default_company_id} = this.props
        dispatch(set_toolbars(PAGE_KEY__COMPANIES_PAGE, ['companies'], "Company list"))
        dispatch(initList(LIST_KEY__COMPANY_LIST))        
        dispatch(update_list_pagination(LIST_KEY__COMPANY_LIST, {page_size:20}))
        if ( default_company_id !== undefined ) {
            dispatch(selectItems(LIST_KEY__COMPANY_LIST, [default_company_id]))
            dispatch(select_companies(PAGE_KEY__COMPANIES_PAGE, [default_company_id]))
            dispatch(setActivelyAvailableAutoClockEntity(default_company_id))
        }
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.selected_company_ids.length !== this.props.selected_company_ids.length ||
             (new_props.selected_company_ids.length > 0 &&
              new_props.selected_company_ids[0] !== this.props.selected_company_ids[0] )) {
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, selected_companies } = props
        let selected_company = null
        if ( selected_companies && selected_companies.length === 1 ) {
            selected_company = selected_companies[0]
        }
        dispatch(setCompanyBreadcrumbsHelper(selected_company))
    }

    onSelectCompanies(company_ids) {
        const { dispatch, history } = this.props
        dispatch(selectItems(LIST_KEY__COMPANY_LIST, company_ids))
        dispatch(select_companies(PAGE_KEY__COMPANIES_PAGE, company_ids))
        if ( company_ids && company_ids.length === 1 ) {
            history.push('/companies/' + company_ids[0]);
        }
    }

    renderLeftPane() {
        return (
            <div className="list-layout__list">
              <CompanyList key="companies"
                           list_key={LIST_KEY__COMPANY_LIST}
                           onSelectCompanies={this.onSelectCompanies} />
            </div>
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
    const {company} = state
    const items_by_id = (company && company.items_by_id) || {}
    const selected_company_ids = get_selected_company_ids(state, PAGE_KEY__COMPANIES_PAGE)
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
        is_single_selection: selected_items.length === 1,
        is_multiple_selection: selected_items.length > 1,
        is_creating_company: is_creating_company,
        default_company_id,
        selected_company,
        show_sidebar
    }
}

export default withRouter(connect(mapStateToProps)(CompaniesPage))


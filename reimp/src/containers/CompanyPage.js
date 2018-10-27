import React, {Component} from 'react'
import {connect} from 'react-redux'
import {includes, keys} from 'lodash'
import {withRouter} from 'react-router-dom'
import { has_permission } from '../actions/Users'
import CompanyList from '../components/CompanyList'
import CompanySidebar from '../components/CompanySidebar'
import NewCompanySidebar from '../components/NewCompanySidebar'
import MultipleCompanySidebar from '../components/MultipleCompanySidebar'
import Splitter from '../components/Splitter'
import {setCompanyBreadcrumbsHelper} from '../actions/Breadcrumbs'
import {
    LIST_KEY__COMPANY_LIST,
    PAGE_KEY__COMPANIES_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    selectItems,
    update_list_filter,
    invalidateList,
    getListFilter,
    getVisibleItemIds,
    areItemsReadyToDisplay
} from '../actions/ItemList'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {
    set_toolbars,
    select_companies,
    select_projects,
    get_selected_company_ids,
    setBrowserTitle,
    setGloballySelectedProjectId
} from '../actions/Page'
import {
    getCandidateCompany,
    isLoadingCompanies,
    getCompaniesById
} from '../actions/Companies'

class CompanyPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectCompanies = this.onSelectCompanies.bind(this)
    }

    componentDidMount() {
        const {dispatch, project_id, list_key, page_key} = this.props
        dispatch(set_toolbars(page_key, ['companies']))
        const new_filter = { project_id: project_id }
        dispatch(update_list_filter(list_key, Object.assign({}, new_filter)))
        dispatch(setGloballySelectedProjectId(project_id))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {

        const { dispatch, list_key, default_filter } = new_props
        if ( new_props.project_id !== this.props.project_id ) {
            dispatch(update_list_filter(list_key, Object.assign({},
                                                                default_filter,
                                                                {project_id: new_props.project_id})))
            dispatch(setGloballySelectedProjectId(new_props.project_id))
        }
        
        if ( new_props.project !== this.props.project ||
             new_props.project_id !== this.props.project_id ||
             new_props.project.name !== this.props.project.name ||
             new_props.selected_company.id !== this.props.selected_company.id ) {
            
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, project_id, list_key, page_key,
               default_company_id, project, 
               selected_company_ids, selected_company} = props
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
        if (project && project.id) {
            dispatch(select_projects(page_key, [project.id]))
            dispatch(invalidateList(list_key))
            dispatch(setCompanyBreadcrumbsHelper(project, selected_company))
        }
        if ( default_company_id !== undefined && !includes(selected_company_ids, default_company_id) ) {
            dispatch(selectItems(LIST_KEY__COMPANY_LIST, [default_company_id]))
            dispatch(select_companies(page_key, [default_company_id]))
        }
    }

    onSelectCompanies(company_ids) {
        const {dispatch, history, project_id,
               list_key, page_key} = this.props
        dispatch(selectItems(list_key, company_ids))
        dispatch(select_companies(page_key, company_ids))
        
        if ( company_ids && company_ids.length === 1 ) {
            history.push('/projects/'+project_id+'/companies/'+company_ids[0]);
        }
    }

    renderLeftPane() {

        const {project_id, list_key } = this.props

        return (
            <CompanyList list_key={list_key}
                                 project_id={project_id}
                                 onSelectCompanies={this.onSelectCompanies}
            />
        )
    }

    renderRightPane() {
        const { selected_company, project_id, is_multiple_selection,
                selected_company_ids, is_creating_company, is_single_selection } = this.props

        if ( is_creating_company ) {
            return (
                <div className="list-layout__sidebar">
                  <NewCompanySidebar />
                </div>
            )
        }
        
        if ( ! is_creating_company && is_single_selection && project_id && selected_company ) {
            return (
                <div className="list-layout__sidebar">
                  <CompanySidebar company_id={selected_company.id} project_id={project_id}/>
                </div>
            )
        }
        
        if ( ! is_creating_company && is_multiple_selection && project_id && selected_company_ids ) {
            return (
                <div className="list-layout__sidebar">
                  <MultipleCompanySidebar company_ids={selected_company_ids} project_id={project_id}/>
                </div>
            )
        }                              
    }

    render() {
        const {show_sidebar, project, can_view } = this.props
        setBrowserTitle(project.name)

        if (! can_view ) {
            return (
                <div>
                  No permission to view companies
                </div>
            )
        }
        
        return (
            <Splitter name="companies_page">
              {this.renderLeftPane()}
              {(show_sidebar && this.renderRightPane()) || null}
            </Splitter>
        )
    }
}

function mapStateToProps(state, props) {
    const default_filter = props.default_filter || {}
    let list_key = props.list_key || LIST_KEY__COMPANY_LIST
    let page_key = props.page_key || PAGE_KEY__COMPANIES_PAGE
    const filter = getListFilter(state, list_key)
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const items_by_id = getCompaniesById(state, visible_item_ids)
    const selected_company_ids = get_selected_company_ids(state, page_key)
    
    const selected_items = items_by_id && selected_company_ids && selected_company_ids.map(function (selected_id, index) {
        return items_by_id[selected_id] || {'id': selected_id,
                                            'loaded': false }
    })

    const project_id = props.match.params.projectId
    const default_company_id = props.match.params.companyId
    const project = getProject(state, project_id) || {}
    const project_name = project.name
    const candidate_company = getCandidateCompany(state) || null
    const is_creating_company = candidate_company || false
    const selected_company = ( selected_items && selected_items.length > 0 && selected_items[0] ) || null
    const show_sidebar = (is_creating_company || (selected_company && selected_company.id)) || false
    const is_loading = !areItemsReadyToDisplay(state, list_key) || isLoadingCompanies(state, keys(items_by_id))

    const can_view = has_permission(state, project_id, "has_view_company")

    return {
        list_key,
        page_key,
        default_filter,
        filter,
        default_company_id,
        project_id: project_id,
        project: project || {},
        selected_companies: selected_items,
        selected_company: selected_company || {},
        selected_company_ids: selected_company_ids,
        is_single_selection: selected_items.length === 1,
        is_multiple_selection: selected_items.length > 1,
        is_creating_company: is_creating_company,
        show_sidebar,
        project_name,
        is_loading,
        can_view
    }
}

export default withRouter(connect(mapStateToProps)(CompanyPage))

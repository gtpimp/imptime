import React, {Component} from 'react'
import { concat, union, difference, includes } from 'lodash'
import { css } from 'emotion'
import {withRouter} from 'react-router-dom'
import { default_theme as theme } from '../theme/default'
import {connect} from 'react-redux'
import CommonTable from './CommonTable'
import 'react-virtualized/styles.css'
import {
    ENTITY_KEY__COMPANY,
    HEADER_LIST_NAME__COMPANY
} from '../actions/ItemListKeyRegistry'
import {
    initList,
    invalidateList,
    getListFilter,
    getLoadingItemIds,
    getSelectedItems,
    getVisibleItemIds,
    getSelectedItemIds,
    getVisibleItems,
    getLastUpdated,
    isLoading
} from '../actions/ItemList'
import {
    invalidateAllCompanies,
    fetchCompaniesIfNeeded,
    cancelCandidateCompany,
    deleteCompanies,
    ALL_AVAILABLE_COMPANY_HEADERS
} from '../actions/Companies'
import DivTableCell from './DivTableCell'

class CompanyList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
        this.onClickedCompany = this.onClickedCompany.bind(this)
        this.onDeleteCompany = this.onDeleteCompany.bind(this)
    }

    componentDidMount() {
        const {dispatch, list_key} = this.props
        dispatch(initList(list_key))
        dispatch(fetchCompaniesIfNeeded(list_key))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, list_key} = new_props
        dispatch(fetchCompaniesIfNeeded(list_key))
    }

    onClickedCompany(event, company_id) {
        const {dispatch, onSelectCompanies, selected_ids} = this.props
        if ( event ) {
            event.stopPropagation()
        }

        let selected_company_ids = []
        if (event.ctrlKey || event.metaKey) {
            if (includes(selected_ids, company_id)) {
                selected_company_ids = difference(selected_ids, [company_id])
            } else {
                selected_company_ids = union(selected_ids, [company_id])
            }
        } else if (event.shiftKey) {
            selected_company_ids = concat(selected_ids, [company_id])
        } else {
            selected_company_ids = [company_id]
        }
        if ( onSelectCompanies ) {
            onSelectCompanies(selected_company_ids)
        }
        dispatch(cancelCandidateCompany())
    }

    onRefresh(event) {
        const {dispatch, company_ids, list_key} = this.props
        dispatch(invalidateList(list_key))
        dispatch(invalidateAllCompanies(company_ids))
        dispatch(cancelCandidateCompany())
        dispatch(fetchCompaniesIfNeeded(list_key))
        if (event) {
            event.stopPropagation()
        }
    }

    onDeleteCompany = (event, company) => {
        const { dispatch, onDelete } = this.props
        event.stopPropagation()

        if ( ! company.can_delete_company ) {
            window.alert("Can't delete this company")
            return
        }
        if ( ! window.confirm( "Delete this company ?") ) {
            return
        }
        dispatch(deleteCompanies([company.id]))
        if ( onDelete ) {
            onDelete(company.id)
        }
    }

    render_candidate_company() {

        const {list_key} = this.props

        return (
            <div key={list_key + ".candidate_company"}
                 className="div-table__row company_list__candidate_company">
              <div className="div-table__cell" colSpan="20">
                Creating new company here
              </div>
            </div>
        )
    }

    renderCell = ({cellData, columnData, columnIndex, dataKey, isScrolling, rowData, rowIndex, activeHeaders}) => {
        const { companies } = this.props
        const key = `company_${columnIndex}_${rowIndex}`
        const header = activeHeaders[columnIndex]
        const header_key = header.key
        const item = companies[rowIndex]
        if ( item.loaded === false ) {
            return (
                <DivTableCell key={key}>
                </DivTableCell>
            )
        }
        if ( item.type === "candidate" ) {
            return  (
                <DivTableCell key={key}
                              extra_style={css`background-color:${theme.colours.new_item_background}`}>
                  { header_key === "name" && "Creating company..." }
                  { header_key !== "name" && <span>&nbsp;</span> }
                </DivTableCell>
            )
        }
        
        const company = item
        let content = null

        if ( isScrolling ) {
            const NON_SCROLLING_FIELDS = []
            if ( includes(NON_SCROLLING_FIELDS, header_key) ) {
                return (
                    <DivTableCell key={key}>
                      null
                    </DivTableCell>
                )
            }
        }
        
        switch(header_key) {
            case "name":
                content = (
                    <DivTableCell key={header.key} >
                      <div>{company.name}</div>
                    </DivTableCell>
                )
                break
            default:
                console.error("Unknown header: " + header_key)
        }
        
        return (
            <div key={key}>
              {content}
            </div>
        )
    }

    render() {

        const { all_headers, companies, selected_ids } = this.props

        if ( companies.length === 0 ) {
            return (
                <div className="div-table__row">
                  <div className="div-table__cell">No companies</div>
                </div>
            )
        }

        return (
            <CommonTable all_headers={all_headers}
                         header_list_name={HEADER_LIST_NAME__COMPANY}
                         onRowSelected={this.onClickedCompany}
                         onRowReordered={this.reorderCompany}
                         items={companies}
                         selected_item_ids={selected_ids}
                         renderCell={this.renderCell}
              />
        )
    }
}

const mapStateToProps = (state, props) => {
    
    const {list_key} = props

    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__COMPANY)
    const selected_item_ids = getSelectedItemIds(state, list_key)
    const selected_items = getSelectedItems(state, list_key, ENTITY_KEY__COMPANY)
    const loading_item_ids = getLoadingItemIds(state, list_key)
    const is_loading = isLoading(state, list_key)
    const last_updated = getLastUpdated(state, list_key)
    const filter = getListFilter(state, list_key)

    return {
        list_key: list_key,
        visible_item_ids,
        companies: visible_items,
        company_ids: visible_item_ids,
        loading_item_ids,
        selected_ids: selected_item_ids,
        selected_items,
        has_items: visible_items && visible_items.length > 0,
        is_loading,
        last_updated,
        all_headers: ALL_AVAILABLE_COMPANY_HEADERS,
        filter
    }        

}

export default withRouter(connect(mapStateToProps)(CompanyList))

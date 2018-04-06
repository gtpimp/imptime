import React, { Component } from 'react'
import {includes, keys} from 'lodash'
//import {withRouter} from 'react-router-dom'
import { connect } from 'react-redux'
import classNames from 'classnames'
//import { DndTypes } from '../actions/Dnd'
import { getCellStyle } from '../actions/ItemListKeyRegistry'
//import { getSelectedItems, setItemflag } from '../actions/ItemList'
//import { has_permission } from '../actions/Users'
import { getInvoice } from '../actions/Invoices'
import Timestamp from './Timestamp'
import SprintName from './SprintName'
import ProjectName from './ProjectName'
import CurrencyValue from './CurrencyValue'

class Invoice extends Component {

    render() {
        const { invoice, is_loading,
                visible_header_keys, header_list } = this.props
	if ( ! invoice ) {
	    return (
                <div className="div-table__row">
                  <div className="div-table__cell">
                    Loading...
                  </div>
                </div>
            )
	}
	
	if ( ! is_loading === false ) {
	    return (
		<div key={this.key+"."+invoice.id}
		     className={classNames("div-table__row")}
		>
		  <div className="div-table__cell">{invoice && invoice.id}</div>
		  <div className="div-table__cell">Loading...</div>
		</div>
	    )
	} else {
            return (
		<div key={this.key+"."+invoice.id}
                     className={classNames('invoice', 'div-table__row')}
		>
                  {includes(visible_header_keys, "invoice_number") &&
		   <div className="div-table__cell"
                        style={getCellStyle(header_list.invoice_number)}>
                     <div className="invoice__cell--name">
                       {invoice.invoice_number}
                     </div>
                   </div>}

                   {includes(visible_header_keys, "client_name") &&
		    <div className="div-table__cell"
                         style={getCellStyle(header_list.client_name)}>
                      <div className="invoice__cell--name">
                        {invoice.client_name}
                      </div>
                    </div>}


                    {includes(visible_header_keys, "project_id") &&
		     <div className="div-table__cell"
                          style={getCellStyle(header_list.project_id)}>
                       <div className="invoice__cell--name">
                         <ProjectName project_id={invoice.project_id}/>
                       </div>
                     </div>}
                     
                     {includes(visible_header_keys, "sprint_id") &&
		      <div className="div-table__cell"
                           style={getCellStyle(header_list.sprint_id)}>
                        <div className="invoice__cell--name">
                          <SprintName sprint_id={invoice.sprint_id}/>
                        </div>
                      </div>} 

                      {includes(visible_header_keys, "created") &&
		       <div className="div-table__cell"
                            style={getCellStyle(header_list.created)}>
                         <div className="invoice__cell--name">
                           <Timestamp format="from_now" value={invoice.created}/>
                         </div>
                       </div>} 


                       {includes(visible_header_keys, "issued_at") &&
		        <div className="div-table__cell"
                             style={getCellStyle(header_list.issued_at)}>
                          <div className="invoice__cell--name">
                            <Timestamp format="from_now" value={invoice.issued_at}/>
                          </div>
                        </div>}


                        {includes(visible_header_keys, "payment_due") &&
		         <div className="div-table__cell"
                              style={getCellStyle(header_list.payment_due)}>
                           <div className="invoice__cell--name">
                             <Timestamp format="from_now" value={invoice.payment_due}/>
                           </div>
                         </div>} 
                        

                         {includes(visible_header_keys, "paid_at") &&
		          <div className="div-table__cell"
                               style={getCellStyle(header_list.paid_at)}>
                            <div className="invoice__cell--name">
                              <Timestamp format="from_now" value={invoice.paid_at}/>
                            </div>
                          </div>} 

                          
                          {includes(visible_header_keys, "status") &&
		           <div className="div-table__cell"
                                style={getCellStyle(header_list.status)}>
                             <div className="invoice__cell--name">
                               {invoice.status}
                             </div>
                           </div>} 

                          {includes(visible_header_keys, "is_overdue") &&
		           <div className="div-table__cell"
                                style={getCellStyle(header_list.is_overdue)}>
                             <div className="invoice__cell--name">
                               <div className={classNames({"icon__status--overdue":invoice.is_overdue,
                                                           "icon__status--not_overdue":!invoice.is_overdue && invoice.status !== 'paid',
                                                           "icon__status--paid":invoice.status === 'paid' })} />
                             </div>
                           </div>}

                           {includes(visible_header_keys, "cost_ex_vat") &&
		            <div className="div-table__cell"
                                 style={getCellStyle(header_list.cost_ex_vat)}>
                              <div className="invoice__cell--name">
                                <CurrencyValue value={invoice.cost_ex_vat} />
                              </div>
                            </div>} 

                            {includes(visible_header_keys, "vat") &&
		             <div className="div-table__cell"
                                  style={getCellStyle(header_list.vat)}>
                               <div className="invoice__cell--name">
                                 <CurrencyValue value={invoice.vat} />
                               </div>
                             </div>} 

                            {includes(visible_header_keys, "cost_with_vat") &&
		             <div className="div-table__cell"
                                  style={getCellStyle(header_list.cost_with_vat)}>
                               <div className="invoice__cell--name">
                                 <CurrencyValue value={invoice.cost_with_vat} />
                               </div>
                             </div>} 

                            {includes(visible_header_keys, "amount_paid") &&
		             <div className="div-table__cell"
                                  style={getCellStyle(header_list.amount_paid)}>
                               <div className="invoice__cell--name">
                                 <CurrencyValue value={invoice.amount_paid} />
                               </div>
                             </div>} 


                             {includes(visible_header_keys, "amount_written_off") &&
		              <div className="div-table__cell"
                                   style={getCellStyle(header_list.amount_written_off)}>
                                <div className="invoice__cell--name">
                                  <CurrencyValue value={invoice.amount_written_off} />
                                </div>
                              </div>} 

                              {includes(visible_header_keys, "amount_owed") &&
		               <div className="div-table__cell"
                                    style={getCellStyle(header_list.amount_owed)}>
                                 <div className="invoice__cell--name">
                                   <CurrencyValue value={invoice.amount_owed} />
                                 </div>
                               </div>} 
                             
                            {includes(visible_header_keys, "invoice_note") &&
		             <div className="div-table__cell"
                                  style={getCellStyle(header_list.invoice_note)}>
                               <div className="invoice__cell--name">
                                 {invoice.invoice_note}
                               </div>
                             </div>} 
                             
                           
                         
                       
                      
		</div>
            )
	}
    }

}

function mapStateToProps(state, props) {
    const { invoice_id, is_loading, header_list } = props
    const invoice = getInvoice(state, invoice_id)
    
    return {
        invoice: invoice,
        invoice_id: invoice_id,
        is_loading: is_loading,
        header_list,
        visible_header_keys: keys(header_list),
    }
}

export default connect(mapStateToProps)(Invoice)

import React, {Component} from 'react'
import ProgressBar from '../ProgressBar'
import {map, keys} from 'lodash'
import CurrencyValue from '../CurrencyValue'
import SprintLink from '../SprintLink'

class ProjectInvoices extends Component {

    render() {
        const { project_statement } = this.props
        const { sprint_infos } = project_statement
        return (
            <div className="project__statement__invoices_grid__header_summary">
              <div className="project__statement__invoices_grid__header_summary_item">
                <table className="project__statement__table">
                  <thead className="project__statement__table_header">
                    <tr>
                      <th>Sprint</th>
                      <th>Budget</th>
                      <th>Actual</th>
                      <th>Invoiced (exVAT)</th>
                      <th>Invoiced (withVAT)</th>
                      <th>Paid</th>
                      <th>Owed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {map(project_statement.invoices, (invoice) =>
                        <tr key={invoice.sprint_id}>
                          <td>
                            <SprintLink sprint_id={invoice.sprint_id}
                                        sprint_name={sprint_infos[invoice.sprint_id].sprint_name}
                                        project_id={sprint_infos[invoice.sprint_id].project_id} />
                          </td>
                          <td>
                            <CurrencyValue value={invoice.budget} />
                          </td>
                          <td>
                            <CurrencyValue value={invoice.total_billable_cost} />
                          </td>
                          <td>
                            <CurrencyValue value={invoice.invoiced_ex_vat} />
                          </td>
                          <td>
                            <CurrencyValue value={invoice.invoiced_with_vat} />
                          </td>
                          <td>
                            <CurrencyValue value={invoice.paid} />
                          </td>
                          <td>
                            <CurrencyValue value={invoice.owed} />
                          </td>
                        </tr>
                     )}
                  </tbody>
                </table>
              </div>
            </div>
        )
    }
}

export default ProjectInvoices

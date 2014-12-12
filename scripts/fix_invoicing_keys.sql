select setval('invoicing_invoicepayment_id_seq', (select max(id) from invoicing_invoicepayment));
select setval('invoicing_invoiceitem_id_seq', (select max(id) from invoicing_invoiceitem));

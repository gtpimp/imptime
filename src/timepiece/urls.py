try:
    from django.conf.urls import patterns, include, url
except ImportError:
    from django.conf.urls.defaults import patterns, include, url

from timepiece.models import Entry
from timepiece import views

urlpatterns = patterns('',
    url(r'^$', views.list_projects, name='landing_page'),
    url(r'^entries$', views.view_entries, name='timepiece-entries'),
    url(r'^period/(?P<delta>\d+)/$', views.view_entries,
        name='timepiece-previous-entries'),
    url(r'^clockin/$', views.clock_in, name='timepiece-clock-in'),
    url(r'^clockout/(?P<entry_id>\d+)/$', views.clock_out,
        name='timepiece-clock-out'),
    url(r'^toggle/(?P<entry_id>\d+)/$', views.toggle_paused,
        name='timepiece-toggle-paused'),
    url(r'^add/$', views.create_edit_entry, name='timepiece-add'),
    url(r'^import/$', views.import_entries, name='timepiece-import'),
    url(r'^update/(?P<entry_id>\d+)/$', views.create_edit_entry,
        name='timepiece-update'),
    url(r'^reject/(?P<entry_id>\d+)/$', views.reject_entry,
        name='timepiece-reject-entry'),
    url(r'^delete/(?P<entry_id>\d+)/$', views.delete_entry,
        name='timepiece-delete'),
    url(r'^search/$', views.quick_search, name='quick_search'),

    url(r'^person/list/$', views.list_people, name='list_people'),
    url(
        r'^person/(?P<person_id>\d+)/$',
        views.view_person,
        name='view_person',
    ),
    url(
        r'^person/create/$',
        views.create_edit_person,
        name='create_person',
    ),
    url(
        r'^person/(?P<person_id>\d+)/edit/$',
        views.create_edit_person,
        name='edit_person',
    ),
    url(r'^business/list/$', views.list_businesses, name='list_businesses'),
    url(
        r'^business/create/$',
        views.create_edit_business,
        name='create_business',
    ),
    url(
        r'^business/(?P<business>\d+)/$',
        views.view_business,
        name='view_business',
    ),
    url(
        r'^business/(?P<business>\d+)/edit/$',
        views.create_edit_business,
        name='edit_business',
    ),
    url(r'^project/list/$',
        views.list_projects, 
        name='list_projects'
    ),

    url(r'^project/amounts_billed/$',
        views.amounts_billed, 
        name='amounts_billed'
    ),

    url(r'^project/users_last_active/$',
        views.users_last_active, 
        name='users_last_active'
    ),

    url(
        r'^project/(?P<project_id>\d+)/$',
        views.view_project,
        name='view_project',
    ),
    url(
        r'^project_detail/(?P<business_id>\d+)/$',
        views.project_detail,
        name='project_detail',
    ),
    url(
        r'^project/create/$',
        views.create_project,
        name='create_project',
    ),
    url(
        r'^project/(?P<project_id>\d+)/edit_project_budget/$',
        views.edit_project_budget,
        name='edit_project_budget',
    ),
    url(
        r'^project/(?P<project_id>\d+)/edit/$',
        views.update_project,
        name='edit_project',
    ),
    url(
        r'^project/(?P<project_id>\d+)/close/$',
        views.create_close_project,
        name='close_project',
    ),
    url(
        r'^project/(?P<project_id>\d+)/open/$',
        views.create_open_project,
        name='open_project',
    ),
    url(
        r'^project/(?P<project_id>\d+)/invoiced/$',
        views.invoiced_project,
        name='invoiced_project',
    ),
    url(
        r'^project/(?P<project_id>\d+)/unbillable/$',
        views.unbillable_project,
        name='unbillable_project',
    ),
    url(
        r'^project/(?P<project_id>\d+)/user/add/$',
        views.add_user_to_project,
        name='add_user_to_project',
    ),
    url(
        r'^project/(?P<project_id>\d+)/user/(?P<user_id>\d+)/remove/$',
        views.remove_user_from_project,
        name='remove_user_from_project',
    ),
    url(
        r'^project/(?P<project_id>\d+)/user/(?P<user_id>\d+)/edit/$',
        views.edit_project_relationship,
        name='edit_project_relationship',
    ),


    url(
        r'^project/(?P<pk>\d+)/delete/$',
        views.DeleteProjectView.as_view(),
        name='delete_project',
    ),
    url(
        r'^business/(?P<pk>\d+)/delete/$',
        views.DeleteBusinessView.as_view(),
        name='delete_business',
    ),
    url(
        r'^person/(?P<pk>\d+)/delete/$',
        views.DeletePersonView.as_view(),
        name='delete_person',
    ),

    ### time sheets ###

    # Reports
    url(r'^reports/$', views.HourlyReport.as_view(), name='hourly_report'),
    url(r'^reports/summary/$', views.summary, name='timepiece-summary'),
    url(r'^reports/payroll/$', views.payroll_summary, name='payroll_summary',),
    url(r'^reports/billable/$', views.BillableHours.as_view(), name='billable_hours'),
    # People
    url(
        r'time-sheet/people/(?P<user_id>\d+)/$',
        views.view_person_time_sheet,
        name='view_person_time_sheet',
    ),
    url(
        r'time-sheet/summary/(?P<user_id>\d+)/$',
        views.view_summary,
        name='view_summary',
    ),

    url(r'income_summary',views.income_summary,name='income_summary'),

    url(
        r'time-sheet/older_summary/(?P<user_id>\d+)/$',
        views.view_summary,
        {'include_older_businesses':True},
        name='view_older_summary',
    ),
    url(
        r'time-sheet/get_project_card/(?P<business_id>\d+)/$',
        views.get_project_card,
        {'index':None},
        name='get_project_card',
    ),
    url(
        r'time-sheet/get_project_card_for_business/(?P<business_id>\d+)/(?P<project_id>\d+)/$',
        views.get_project_card_for_business,
        name='get_project_card_for_business',
    ),
    url(
        r'time-sheet/get_project_card/(?P<business_id>\d+)/(?P<index>\d+)/$',
        views.get_project_card,
        name='get_project_card_indexed',
    ),
    url(
        r'time-sheet-download/people/(?P<user_id>\d+)/$',
        views.time_sheet_download,
        name='time_sheet_download',
    ),
    url(
        r'^time-sheet/(?P<action>verify|approve)/(?P<user_id>\d+)/' +
        r'(?P<from_date>\d\d\d\d-\d\d-\d\d)/$',
        views.change_person_time_sheet,
        name='change_person_time_sheet',
    ),
    # Projects
    url(
        r'^time-sheet/project/(?P<pk>\d+)/$',
        views.ProjectTimesheet.as_view(),
        name='project_time_sheet',
    ),
    url(
        r'^time-sheet/project_issues/(?P<pk>\d+)/$',
        views.project_issues,
        name='project_issues',
    ),
    url(
        r'^time-sheet/business_issues/(?P<pk>\d+)/$',
        views.business_issues,
        name='business_issues',
    ),
    url(
        r'^time-sheet/issue_detail/(?P<issue_id>\d+)/$', views.issue_detail, name='issue_detail',
    ),
    url(
        r'^time-sheet/issue_detail_update/$', views.issue_detail_update, name='issue_detail_update',
    ),
    url(
        r'^time-sheet/issue_status_update/$', views.issue_status_update, name='issue_status_update',
    ),

    url(
        r'^time-sheet/update_issue_with_feature$', views.update_issue_with_feature, name='update_issue_with_feature',
    ),                         

    url(
        r'^time-sheet/issue_subject_update/$', views.issue_subject_update, name='issue_subject_update',
    ),
    url(
        r'^time-sheet/issue_points_update/$', views.issue_points_update, name='issue_points_update',
    ),
    url(
        r'^time-sheet/unassigned_timesheet_entries/(?P<project_id>\d+)/$', views.unassigned_timesheet_entries, name='unassigned_timesheet_entries',
    ),
    url(
        r'^time-sheet/all_timesheet_entries/(?P<project_id>\d+)/$', views.all_timesheet_entries, name='all_timesheet_entries',
    ),
                       
    url(
        r'^time-sheet/project/(?P<pk>\d+)/csv/$',
        views.ProjectTimesheetCSV.as_view(),
        name='export_project_time_sheet',
    ),
    url(
        r'^projection/$',
        views.projection_summary,
        name='projection_summary',
    ),
    url(
        r'^edit-settings/$',
        views.edit_settings,
        name='edit_settings',
    ),

    ### Invoices ###
    url(
        r'^invoice/outstanding/$',
        views.invoice_projects,
        name='invoice_projects',
    ),
    url(
        r'invoice/project/(?P<project_id>\d+)/create/' +
        r'(?P<to_date>\d\d\d\d-\d\d-\d\d)/' +
        r'(?:(?P<from_date>\d\d\d\d-\d\d-\d\d)/)?$',
        views.confirm_invoice_project,
        name='confirm_invoice_project',
    ),
    url(
        r'^invoice/list/$',
        views.InvoiceList.as_view(),
        name='list_invoices',
    ),
    url(
        r'^invoice/(?P<pk>\d+)/$',
        views.InvoiceDetail.as_view(),
        name='view_invoice',
    ),
    url(
        r'^invoice/(?P<pk>\d+)/entries/$',
        views.InvoiceEntryDetail.as_view(),
        name='view_invoice_entries',
    ),
    url(
        r'^invoice/(?P<pk>\d+)/csv/$',
        views.InvoiceCSV.as_view(),
        name='view_invoice_csv',
    ),
    url(
        r'^invoice/edit/(?P<pk>\d+)/$',
        views.InvoiceEdit.as_view(),
        name='edit_invoice',
    ),
    url(
        r'^invoice/delete/(?P<pk>\d+)/$',
        views.InvoiceDelete.as_view(),
        name='delete_invoice',
    ),
    url(
        r'^invoice/remove-entry/(?P<invoice_id>\d+)/(?P<entry_id>\d+)/$',
        views.remove_invoice_entry,
        name='remove_invoice_entry',
    ),
    # contracts
    url(
        r'^contract/(?P<pk>\d+)/$',
        views.ContractDetail.as_view(),
        name='view_contract',
    ),
    url(
        r'^contract/list/$',
        views.ContractList.as_view(),
        name='list_contracts',
    ),
    # project hours
    url(
        r'^schedule/$',
        views.ProjectHoursView.as_view(),
        name='project_hours',
    ),
    url(
        r'^schedule/edit/$',
        views.EditProjectHoursView.as_view(),
        name='edit_project_hours'
    ),

    # ajax views
    url(
        r'^ajax/hours/$',
        views.ProjectHoursAjaxView.as_view(),
        name='project_hours_ajax_view',
    ),
    url(
        r'^ajax/hours/(?P<pk>\d+)/$',
        views.ProjectHoursDetailView.as_view(),
        name='project_hours_detail_view',
    ),

    url(r'^view_project_rates/(?P<project_id>\d+)$', views.view_project_rates, name='view_project_rates'),
    url(r'^ajax/edit_project_rate/(?P<project_id>\d+)$', views.edit_project_rate, name='edit_project_rate'),
    url(r'^ajax/edit_default_user_rates$', views.edit_default_user_rates, name='edit_default_user_rates'),

    url(
        r'^ajax/set_project_rate$',
        views.set_project_rate,
        name='set_project_rate',
        ),
    url(
        r'^ajax/create_expense$',
        views.create_expense,
        name='create_expense'
        ),
    
    # salary views
    url(
        r'^salary/list',
        views.SalaryView.as_view(),
        name='salary_view'
        ),
    url(
        r'^salary/edit/(?P<user_id>\d+)/$',
        views.salary_edit,
        name='salary_edit'
        ),
    url(
        r'^salary/payslip/(?P<salary_id>\d+)/(?P<preview>\d+)$',
        views.salary_payslip,
        name='salary_payslip'
        ),

    # Expenses views
    url(
        r'^expense/list',
        views.expense_list,
        name='expense_list'
        ),

    # Timesheet views
    url(
        r'^incremental_timesheets_by_project$',
        views.incremental_timesheets_by_project,
        name='incremental_timesheets_by_project'
        ),

    url(
        r'^revenue$',
        views.revenue,
        name='revenue'
        ),

    url(
        r'^graphs$',
        views.graphs,
        name='graphs'
        ),
    url(
        r'^daily_graph$',
        views.daily_graph,
        name='daily_graph'
        ),

     url(
         r'^invoice/list',
         views.invoice_list,
         name='invoice_list'
         ),  
    url(
        r'^ajax/create_invoice$',
        views.create_invoice,
        name='create_invoice'
        ),
    url(
        r'^show_timeline/(?P<project_id>\d+)$',
        views.show_timeline,
        name='show_timeline'
      ),
    url(
        r'^show_permissions/(?P<business_id>\d+)$',
        views.show_permissions,
        name='show_permissions'
      ),
    url(
        r'^add_issue/(?P<project_id>\d+)$',
        views.add_issue,
        name='add_issue'
      ),
    url(
        r'^add_project/(?P<business_id>\d+)$',
        views.add_project,
        name='add_project'
      ),
    url(
        r'^delete_issue/(?P<project_id>\d+)$',
        views.delete_issue,
        name='delete_issue'
      ),
    url(
        r'time-sheet/get_issue_row/(?P<issue_id>\d+)$',
        views.get_issue_row,
        name='get_issue_row',
    ),
    url(
        r'time-sheet/get_project_row/(?P<project_id>\d+)$',
        views.get_project_row,
        name='get_project_row',
    ),
    url(
        r'^sortable_issue_update/(?P<project_id>\d+)/$',
        views.sortable_issue_update,
        name='sortable_issue_update'
        ),
    url(
        r'^sortable_project_update$',
        views.sortable_project_update,
        name='sortable_project_update'
        ),
    url(
        r'^time-sheet/project_list/(?P<project_id>\d+)/$',
        views.project_list,
        name='project_list',
    ),
    url(
        r'^time-sheet/project_list$',
        views.project_list,
        name='project_list',
    ),
    url(
        r'^time-sheet/project_detail/(?P<project_id>\d+)/$',
        views.get_project_detail,
        name='get_project_detail',
    ),
   url(
        r'^time-sheet/add_feature/(?P<business_id>\d+)/$',
        views.add_feature,
        name='add_feature',
        ),  
   url(
        r'^time-sheet/business_features/(?P<business_id>\d+)/$',
        views.business_features,
        name='business_features',
        ),  
   url(
        r'^time-sheet/sprint_export/(?P<project_id>\d+)/$',
        views.sprint_export,
        name='sprint_export',
  	),                         
    # url(
    #     r'^project/(?P<pk>\d+)/delete/$',
    #     views.DeleteProjectView.as_view(),
    #     name='delete_project',
    # ),

)

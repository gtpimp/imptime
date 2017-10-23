from django.contrib import admin
from timepiece import models as timepiece

from timepiece.projection import run_projection


class ActivityAdmin(admin.ModelAdmin):
    model = timepiece.Activity
    list_display = ('code', 'name', 'billable')
    list_filter = ('billable',)
admin.site.register(timepiece.Activity, ActivityAdmin)


class HourGroupAdmin(admin.ModelAdmin):
    model = timepiece.HourGroup
    list_display = ('name',)
    list_filter = ('activities',)
    ordering = ('order', 'name')
admin.site.register(timepiece.HourGroup, HourGroupAdmin)


class ActivityGroupAdmin(admin.ModelAdmin):
    model = timepiece.ActivityGroup
    list_display = ('name',)
    list_filter = ('activities',)
admin.site.register(timepiece.ActivityGroup, ActivityGroupAdmin)


class RelationshipTypeAdmin(admin.ModelAdmin):
    pass
admin.site.register(timepiece.RelationshipType, RelationshipTypeAdmin)


class BusinessAdmin(admin.ModelAdmin):
    pass
admin.site.register(timepiece.Business, BusinessAdmin)


class EntryAdmin(admin.ModelAdmin):
    model = timepiece.Entry
    list_display = ('user',
                    'issue',
                    'location',
                    'project_type',
                    'activity',
                    'start_time',
                    'end_time',
                    'hours',
                    'is_closed',
                    'is_paused',
                    )
    list_filter = ['activity', 'issue__project__type', 'user', 'issue']
    search_fields = ['user__first_name', 'user__last_name', 'issue__project__name',
                     'activity__name', 'comments']
    date_hierarchy = 'start_time'
    ordering = ('-start_time',)

    def project_type(self, entry):
        return entry.issue.project.type
admin.site.register(timepiece.Entry, EntryAdmin)


class AttributeAdmin(admin.ModelAdmin):
    search_fields = ('label', 'type')
    list_display = ('label', 'type', 'enable_timetracking', 'billable')
    list_filter = ('type', 'enable_timetracking', 'billable')
    #Django honors only first field
    ordering = ('type', 'sort_order')
admin.site.register(timepiece.Attribute, AttributeAdmin)


class ContractAssignmentInline(admin.TabularInline):
    model = timepiece.ContractAssignment
    raw_id_fields = ('user',)

    def queryset(self, request):
        qs = super(ContractAssignmentInline, self).queryset(request)
        return qs.select_related()


class ContractMilestoneInline(admin.TabularInline):
    model = timepiece.ContractMilestone


class ProjectContractInline(admin.TabularInline):
    model = timepiece.ProjectContract


class ProjectAdmin(admin.ModelAdmin):
    model = timepiece.Project
    raw_id_fields = ('business',)
    list_display = ('name', 'business', 'point_person', 'status3', 'type',)
    list_filter = ('type', 'status3')
    inlines = (ProjectContractInline,)
admin.site.register(timepiece.Project, ProjectAdmin)


class PersonScheduleAdmin(admin.ModelAdmin):
    list_display = ('user', 'hours_per_week', 'end_date', 'total_available',
                    'scheduled', 'unscheduled')

    def total_available(self, obj):
        return "%.2f" % (obj.hours_available,)

    def scheduled(self, obj):
        return "%.2f" % (obj.hours_scheduled,)

    def unscheduled(self, obj):
        return "%.2f" % (obj.hours_available - float(obj.hours_scheduled),)

    def save_model(self, request, obj, form, change):
        obj.save()
        run_projection()

    def delete_model(self, request, obj):
        obj.delete()
        run_projection()

admin.site.register(timepiece.PersonSchedule, PersonScheduleAdmin)


class LocationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
admin.site.register(timepiece.Location, LocationAdmin)


class AllocationAdmin(admin.ModelAdmin):
    list_display = ('date', 'hours', 'hours_worked', 'hours_left',)
admin.site.register(timepiece.AssignmentAllocation, AllocationAdmin)


class ProjectHoursAdmin(admin.ModelAdmin):
    list_display = ('_person', 'project', 'week_start', 'hours', 'published')

    def _person(self, obj):
        return obj.user.get_full_name()
    _person.short_description = 'Person'
    _person.admin_order_field = 'user__last_name'

admin.site.register(timepiece.ProjectHours, ProjectHoursAdmin)

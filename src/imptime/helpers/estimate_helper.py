from timepiece.models import Rate, User, IssuePoints
from django.db.models import Sum, Avg

def get_comparative_estimates(sprint, logged_in_user):

    """ gets estimates as if the each developer in the project was going to do all the work
        in the sprint, supported by a tester and a manager"""
    
    users = User.objects.filter(pk__in=[x.id for x in sprint.business.get_users_allowed_to_estimate_on_business(logged_in_user)])
    developers = users.filter(rates__project_id=sprint.id, rates__time_tracking_mode='developer')
    developer_estimates = IssuePoints.objects.filter(issue__project=sprint,
                                                     user_id__in=[x.pk for x in developers])
    developer_estimate_hours = developer_estimates.order_by("user_id")\
                                                  .values('user_id')\
                                                  .annotate(total_hours=Sum('points'))

    estimates = {'by_user':{}, 'aggregates':{}}
    slowest_user_id = None
    fastest_user_id = None
    for user_estimate_info in developer_estimate_hours:
        if not user_estimate_info['total_hours']:
            continue

        rate = Rate.objects.get(user=user_estimate_info['user_id'],
                                          project=sprint)
        developer_rate = rate.billable_amount
        developer_rate_with_commission = float(developer_rate) * float((1+(sprint.commission_percentage/100)))
        developer_velocity_adjusted_hours = float((user_estimate_info['total_hours'] or 0)) * float((rate.velocity or 1))
        developer_cost = float(developer_velocity_adjusted_hours) * float(developer_rate)

        tester_adjusted_hours = float(developer_velocity_adjusted_hours) * float(sprint.ratio_testing)
        tester_rate = Rate.objects.filter(project=sprint,
                                          time_tracking_mode='tester')\
                                  .aggregate(Avg('billable_amount'))['billable_amount__avg'] or 0
        tester_rate_with_commission = float(tester_rate) * float((1+(sprint.commission_percentage/100)))
        tester_cost = float(tester_adjusted_hours) * float(tester_rate_with_commission)


        manager_adjusted_hours = float(developer_velocity_adjusted_hours) * float(sprint.ratio_management)
        manager_rate = Rate.objects.filter(project=sprint,
                                           time_tracking_mode='manager')\
                                   .aggregate(Avg('billable_amount'))['billable_amount__avg'] or 0
        manager_rate_with_commission = float(manager_rate) * float((1+(sprint.commission_percentage/100)))
        manager_cost = float(manager_adjusted_hours) * float(manager_rate_with_commission)

        working_cost = developer_cost + tester_cost + manager_cost
        total_cost = working_cost * (1+sprint.ratio_scope_creep)

        total_hours = (developer_velocity_adjusted_hours + tester_adjusted_hours + manager_adjusted_hours) * (1+sprint.ratio_scope_creep)

        if slowest_user_id is None or total_hours > estimates[slowest_user_id]['total_hours']:
            slowest_user_id = user_estimate_info['user_id']
        if fastest_user_id is None or total_hours < estimates[fastest_user_id]['total_hours']:
            fastest_user_id = user_estimate_info['user_id']
        
        estimates['by_user'][user_estimate_info['user_id']] = { 'user_id': user_estimate_info['user_id'],
                                                                'developer_original_hours': user_estimate_info['total_hours'],
                                                                'developer_velocity': rate.velocity,
                                                                'developer_adjusted_hours': developer_velocity_adjusted_hours,
                                                                'developer_rate': developer_rate,
                                                                'developer_rate_with_commission': developer_rate_with_commission,
                                                                'developer_cost': developer_cost,
                                                                'tester_ratio': sprint.ratio_testing,
                                                                'tester_adjusted_hours': tester_adjusted_hours,
                                                                'tester_rate': tester_rate,
                                                                'tester_rate_with_commission': tester_rate_with_commission,
                                                                'tester_cost': tester_cost,
                                                                'manager_ratio': sprint.ratio_management,
                                                                'manager_adjusted_hours': manager_adjusted_hours,
                                                                'manager_rate': manager_rate,
                                                                'manager_rate_with_commission': manager_rate_with_commission,
                                                                'manager_cost': manager_cost,
                                                                'working_cost': working_cost,
                                                                'ratio_scope_creep': sprint.ratio_scope_creep,
                                                                'total_hours':  total_hours,
                                                                'total_cost': total_cost }
    estimates['aggregates']['slowest_user_id'] = slowest_user_id
    estimates['aggregates']['fastest_user_id'] = fastest_user_id
        
    return estimates


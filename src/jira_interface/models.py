from django.db import models
import timepiece.models as timepiece
import datetime

class Jira(models.Model):
    """ model which associates a business with a jira installation """

    business = models.ForeignKey(
        timepiece.Business, 
        related_name='jira', blank=False, null=False, on_delete=models.CASCADE)
    host = models.CharField(max_length=255, blank=False, null=False) #jira host
    board_id = models.CharField(
        max_length=20, blank=False, null=False, 
        help_text="this is the rapidView id in the jira url")
    custom_field_name_for_issue_order = models.CharField(
        max_length=20, blank=False, null=False, default="customfield_10006", 
        help_text="the name of the field used to hold the issue sorting value ")

    sync_actual_times = models.BooleanField(default=False, blank=True)
    sync_issue_ordering_to_jira = models.BooleanField(default=False, blank=True)
    sync_issue_ordering_from_jira = models.BooleanField(default=True, blank=True)

    def get_user_settings(self, user):
        return JiraUser.objects.get_or_create(jira=self, timepiece_user=user)[0]

class JiraUser(models.Model):
    jira = models.ForeignKey(Jira, blank=False, null=False, on_delete=models.CASCADE)
    timepiece_user = models.ForeignKey(timepiece.User, related_name='jira_user', blank=False, null=False, on_delete=models.CASCADE)
    jira_username = models.CharField(max_length=255, blank=False, null=False)
    jira_password = models.CharField(max_length=255, blank=False, null=False)

class JiraSyncStatus(models.Model):
    
    jira = models.ForeignKey(Jira, blank=False, null=False, on_delete=models.CASCADE)
    updated_at = models.DateTimeField(blank=True, null=True)

    @classmethod
    def get_most_recent_updated_at(self, business):
        try:
            status = JiraSyncStatus.objects.filter(jira__business=business).order_by("-updated_at")[0]
        except JiraSyncStatus.DoesNotExist:
            status = JiraSyncStatus.objects.create(jira__business=business, updated_at=datetime.datetime.today())
        return status

    @classmethod
    def set_most_recent_updated_at(self, business):
        JiraSyncStatus.objects.create(jira__business=business, updated_at=datetime.datetime.today())


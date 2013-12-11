from django.db import models
import timepiece.models as timepiece

class Jira(models.Model):
    """ model which associates a business with a jira installation """

    business = models.ForeignKey(timepiece.Business, related_name='jira', blank=False, null=False)
    username = models.CharField(max_length=255, blank=False, null=False)
    password = models.CharField(max_length=255, blank=False, null=False)
    host = models.CharField(max_length=255, blank=False, null=False)
    board_id = models.CharField(max_length=20, blank=False, null=False, help_text="this is the rapidView id in the jira url")

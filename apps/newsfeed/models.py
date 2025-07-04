from django.db import models
from django.contrib.auth.models import User
from projects.models import App
from issues.models import Issue
from newsfeed.managers import *


class Activity(models.Model):
    # This needs to take a model object and an object_id
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=400)
    application = models.ForeignKey(App, blank=True, null=True, on_delete=models.SET_NULL)
    #defect = models.ForeignKey(Defect, blank=True, null=True)
    issue = models.ForeignKey(Issue, blank=True, null=True, on_delete=models.SET_NULL)
    date_action = models.DateTimeField(auto_now=True, auto_now_add=True)
    
    objects = ActivityManager()
    
    def __unicode__(self):
        return "%s %s" % (self.user.username, self.action)


    class Meta:
        ordering = ['-date_action']

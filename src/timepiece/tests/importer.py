from timepiece.tests.base import TimepieceDataTestCase
from timepiece import models as timepiece
from timepiece import utils
from django.contrib.auth.models import User, Permission
from django.urls import reverse

class ImportProjectTestCase(TimepieceDataTestCase):
    def test_import_invalid(self):
        self.client.login(username=self.user.username, password='abc')
        response = self.client.post(reverse('timepiece.views.import_entries'),
                                    {'raw_entries': "business|project"},)
        self.client.logout()
        self.assertTrue(response.context['errors'])
        self.assertEqual(response.context['errors'][0]['msg'],
                         'need more than 2 values to unpack')

    def test_import_project_validation_modify_name(self):
        self.client.login(username=self.superuser.username, password='abc')
        response = self.client.post(reverse('timepiece.views.import_entries'),
                                    {'raw_entries': "13-Jan-13|Example Business|ExampleProject1|Description|8.5"},)
        self.client.logout()
        self.assertTrue(response.context['num_entries_created'])

    def test_import_project_does_not_exist(self):
        self.client.login(username=self.superuser.username, password='abc')
        response = self.client.post(reverse('timepiece.views.import_entries'),
                                    {'raw_entries': "13-Jan-13|Example Business|EaeouoaeuxampleProject1|Description|8.5"},)
        self.assertTrue(response.context['errors'])

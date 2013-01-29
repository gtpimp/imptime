from django.db import models

class QuerySetManager(models.Manager):

    def __init__(self, qs_class):
        super(QuerySetManager, self).__init__()
        self.queryset_class = qs_class

    def get_query_set(self):
        return self.queryset_class(self.model)

    def __getattr__(self, attr, *args):
        try:
            return getattr(self.__class__, attr, *args)
        except AttributeError, ex:
            try:
                return getattr(self.get_query_set(), attr, *args)
            except AttributeError:
                raise ex

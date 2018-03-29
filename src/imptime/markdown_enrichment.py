
class MarkdownEnrichment(object):

    def __init__(self, logged_in_user):
        super(MarkdownEnrichment, self).__init__()
        self.logged_in_user = logged_in_user
    
    def enrich(self, s):
        return "Enriched %s" % s
    
    

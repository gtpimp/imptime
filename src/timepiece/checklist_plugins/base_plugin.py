
class BasePlugin(object):

    def __init__(self, name, business):
        super(BasePlugin, self).__init__()
        self.business = business
        self.name = name

    def check_for_problems(self):
        """ return a list of dictionaries of the form:

            [ { 'state':'ok/failed/error', 'msg':'any human text that helps fix the problem' }, ]

        """
        raise Exception("Must be implemented")

    def _create_problem_item(self, msg, issue=None, project=None):
        """ for use by inheriting classes, helps to ensure that the data being returned is consistent across plugins """
        return { 'msg': msg,
                 'issue': issue,
                 'project': project }

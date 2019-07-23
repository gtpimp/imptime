from aws_requests_auth.aws_auth import AWSRequestsAuth
from elasticsearch import Elasticsearch, RequestsHttpConnection, serializer, compat, exceptions

AWS_ACCESS_KEY="XXX"
AWS_SECRET_ACCESS_KEY="XXX"
AWS_ES_HOST='search-service-foobar.us-east-1.es.amazonaws.com'
AWS_REGION="us-east-1"
AWS_ES_SERVICE="es"
AWS_ES_PORT=80

auth = AWSRequestsAuth(aws_access_key=AWS_ACCESS_KEY,
                       aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                       aws_host=AWS_HOST,
                       aws_region=AWS_REGION,
                       aws_service=AWS_ES_SERVICE)

class JSONSerializerPython2(serializer.JSONSerializer):
    def dumps(self, data):
        if isinstance(data, compat.string_types):
            return data
        try:
            return json.dumps(data, default=self.default, ensure_ascii=True)
        except (ValueError, TypeError) as e:
            raise exceptions.SerializationError(data, e)

es_client = Elasticsearch(host=AWS_ES_HOST,
                          port=AWS_ES_PORT,
                          connection_class=RequestsHttpConnection,
                          http_auth=auth,
                          serializer=JSONSerializerPython2())

ES_CLIENT=es_client

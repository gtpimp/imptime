import nltk
import logging
logger=logging.getLogger(__name__)

class CommandParser(object):

    def __init__(self):
        super(CommandParser, self).__init__()
        self.words = None
    
    def _prepare(self):
        nltk.download('punkt')
        nltk.download("averaged_perceptron_tagger")
    
    def parse(self, command):
        self.command = command
        try:
            self.tokens = nltk.word_tokenize(self.command)
        except Exception, ex:
            if "Please use the NLTK Downloader" in str(ex):
                self._prepare()
                return self.parse(command)
            else:
                logger.exception(ex)
                raise
            
        self.tagged = nltk.pos_tag(self.tokens)

        self.words = dict( [ (y,x) for x,y in self.tagged ] )

    def __unicode__(self):
        return str(self.words)
        
    @property
    def subject(self):
        return self.words.get('NN', None)

    @property
    def verb(self):
        return self.words.get('VBD', None) or self.words.get('RB', None) or self.words.get('JJ', None)

    

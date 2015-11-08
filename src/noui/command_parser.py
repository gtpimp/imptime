import nltk

class CommandParser(object):

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
            
        self.tagged = nltk.pos_tag(self.tokens)

        self.words = dict( [ (y,x) for x,y in self.tagged ] )

    @property
    def subject(self):
        return self.words['NN']

    @property
    def verb(self):
        return self.words.get('VBD', None) or self.words.get('RB', None) or self.words.get('JJ', None)
    

    

    
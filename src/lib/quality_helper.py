
class Quality(object):

    MINIMUM_NUM_LETTERS_FOR_LONG_WORD = 4
    MAX_WORDS_FOR_GOOD_QUALITY = 7
    
    def check_sequence_of_short_steps(self, s):
        if s is None:
            return None
        lines = s.split("\n")
        quality_error = None
        for line_number, line in enumerate(lines):
            quality_error = self.check_short_sentence(line)
            if quality_error is not None:
                return "Line %d %s" % ((line_number+1), quality_error)
        return None
    
    def check_short_sentence(self, s):
        if s.strip().startswith(":"):
            return None
        words = s.split(" ")
        long_words = [w for w in words if len(w) >= self.MINIMUM_NUM_LETTERS_FOR_LONG_WORD]
        if len(long_words) > self.MAX_WORDS_FOR_GOOD_QUALITY:
            return "has too many long words, max %d words allowed" % (self.MAX_WORDS_FOR_GOOD_QUALITY)
        return None
    

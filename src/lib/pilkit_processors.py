
from pilkit.processors import ResizeToFit

class ResizeToRatio(ResizeToFit):

    def __init__(self, width_ratio, height_ratio, *args, **kwargs):
        super(ResizeToRatio, self).__init__(width=100, height=100, *args, **kwargs)
        self.width_ratio = width_ratio
        self.height_ratio = height_ratio

    def process(self, img):
        self.width = float(img.size[0]) * self.width_ratio
        self.height = float(img.size[1]) * self.height_ratio
        return super(ResizeToRatio, self).process(img)

class ResizeWithAspect(ResizeToFit):

    def __init__(self, max_dimension, *args, **kwargs):
        super(ResizeWithAspect, self).__init__(width=100, height=100, *args, **kwargs)
        self.max_dimension = max_dimension

    def process(self, img):
        width, height = img.size
        if width > height:
            ratio = float(self.max_dimension)/width
        else:
            ratio = float(self.max_dimension)/height
        self.width = width * ratio
        self.height = height * ratio
        return super(ResizeWithAspect, self).process(img)
    

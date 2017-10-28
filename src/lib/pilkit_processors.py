
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


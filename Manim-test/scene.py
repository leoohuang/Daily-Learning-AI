from manim import *

class CreateCircle(Scene):
    def construct(self):
        # 1. 创建图形
        circle = Circle()  # 圆
        circle.set_fill(PINK, opacity=0.5)  # 粉色填充

        square = Square()  # 正方形
        square.set_fill(BLUE, opacity=0.5)  # 蓝色填充

        # 2. 播放动画
        self.play(Create(circle))  # 画圆
        self.play(Transform(circle, square))  # ✨见证魔法：把圆变成方
        self.play(FadeOut(circle))  # 淡出
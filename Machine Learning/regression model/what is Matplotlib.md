# Matplotlib 是什么？

**Matplotlib** (读作 /mætˈplɒtˌlɪb/) 是 Python 中最流行、最老牌的**数据可视化库**。

如果说 NumPy 是数据处理的地基，那么 Matplotlib 就是**数据的“照相机”**——它负责将枯燥的数字（NumPy 数组）转换成直观的图表（如折线图、柱状图、散点图）。

---

## 1. 核心概念：画布与子图
Matplotlib 的设计逻辑非常像现实中的绘图：
* **Figure (画布)：** 整个图片的最底层容器，就像一张白纸。
* **Axes (坐标系/子图)：** 画布上的具体图表区域（包含 x 轴、y 轴、标题等）。一张画布可以包含一个或多个子图。

## 2. 为什么要用 Matplotlib？
* **功能极其全面：** 只要你能想到的 2D 图表，它几乎都能画出来。
* **高度可定制：** 图表中的每一个像素（线条粗细、颜色、字体、刻度位置）都可以通过代码精确控制。
* **出版级质量：** 它是许多学术论文和期刊的首选绘图工具，生成的图片质量极高。
* **生态基石：** 许多更高级的绘图库（如 **Seaborn**）和数据分析库（如 **Pandas**）的绘图功能，底层调用的都是 Matplotlib。

## 3. Matplotlib 能画什么？
它支持几十种图表类型，最常用的包括：
* **折线图 (Plot):** 观察数据随时间的变化趋势。
* **散点图 (Scatter):** 观察两个变量之间的关系（比如身高和体重）。
* **柱状图 (Bar):** 对比不同类别的数值大小。
* **直方图 (Hist):** 统计数据的分布情况。
* **热力图 (Imshow/Heatmap):** 可视化矩阵数据。

---

## 4. 简单的代码示例

Matplotlib 通常和 NumPy 一起使用。最常用的子模块是 `pyplot`（通常简写为 `plt`）。

```python
import matplotlib.pyplot as plt
import numpy as np

# 1. 准备数据 (使用 NumPy 生成)
x = np.linspace(0, 10, 100)  # 0到10之间生成100个点
y = np.sin(x)                # 计算对应的 sin 值

# 2. 开始绘图
plt.figure(figsize=(8, 4))   # 创建一个宽8高4的画布
plt.plot(x, y, label="Sin(x)", color="blue", linewidth=2) # 画折线图

# 3. 添加装饰
plt.title("Simple Sine Wave") # 标题
plt.xlabel("Time (s)")        # X轴标签
plt.ylabel("Amplitude")       # Y轴标签
plt.legend()                  # 显示图例
plt.grid(True)                # 显示网格

# 4. 展示图片
plt.show()
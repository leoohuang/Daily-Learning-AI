# NumPy 是什么

**NumPy** (读作 /nʌm paɪ/，全称 **Num**erical **Py**thon) 是 Python 语言中用于**科学计算**的最基础、最重要的库。

简单来说，几乎所有使用 Python 进行数据分析、机器学习或深度学习的工具（如 Pandas, Scikit-Learn, TensorFlow, PyTorch），底层都在使用 NumPy。

---

## 1. 核心：多维数组对象 (ndarray)
NumPy 的核心是 `ndarray`（N-dimensional array），即**N维数组**。
* 它是一个包含同类型元素（通常是数字）的网格。
* 它不仅支持一维数组（向量），还支持二维数组（矩阵）甚至更高维度的数组（张量）。

## 2. 为什么要用 NumPy？（相比 Python 原生列表 List）

你可能会问：“Python 已经有列表（List）了，为什么还需要 NumPy 数组？” 答案主要在于**性能**和**功能**。

* **速度极快：** NumPy 的核心代码是用 **C 语言**编写的。对于涉及大量数据的数学运算，NumPy 比 Python 原生的循环和列表快几十倍甚至上百倍。
* **内存更省：** NumPy 数组在内存中紧凑存储，比 Python 列表占用更少的内存。
* **向量化运算（Vectorization）：** 可以在整个数组上直接进行数学运算，而不需要写 `for` 循环。
    * *例子：* 让一个列表里的 100 万个数字都乘以 2，Python 需要写循环，而 NumPy 只需要一行代码 `array * 2`。

## 3. NumPy 能做什么？

NumPy 提供了一整套极其丰富的数学函数库，主要包括：

* **线性代数：** 矩阵乘法、求逆、特征值计算等。
* **傅里叶变换：** 信号处理常用的工具。
* **随机数生成：** 强大的随机抽样功能（常用于模拟和机器学习初始化）。
* **数组操作：** 变形（Reshape）、切片（Slicing）、拼接、广播（Broadcasting）等。

---

## 4. 简单的代码示例

以下是一个简单的对比，展示 NumPy 的简洁性：

```python
import numpy as np

# 1. 创建一个数组
data = np.array([1, 2, 3, 4, 5])

# 2. 基本运算（每个元素都乘以 10）
# 在原生 Python 中，你需要写一个循环或推导式
# 在 NumPy 中，直接乘即可
result = data * 10 

print(result)
# 输出: [10 20 30 40 50]

# 3. 统计计算
print(f"平均值: {np.mean(data)}")
print(f"最大值: {np.max(data)}")
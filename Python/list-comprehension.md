# Python 列表推导式学习

今天学到了一个很酷的写法，可以一行代码生成列表！

## 例子
```python
# 普通写法
list = []
for i in range(10):
    list.append(i*i)

# 推导式写法
list = [i*i for i in range(10)]

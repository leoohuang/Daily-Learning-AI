import numpy as np
import scipy as sp

#scipy 余弦距离/相似度
from scipy.spatial import distance
distance.cosine(vector1,vector2)

#稀疏数组创建
# numpy array
dense_arr = np.array([0,0,9],[0,8,0])
# transfer to coo
sparse_coo = sp.sparse.coo_array(dense_arr)

#大数据，直接构建 不用 Numpy
values = [9,8]
rows = [0,1]
cols = [2,1]
sparse_csr = sp.sparse.csr_array(values,(rows,cols))
print(sparse_csr)

#文本处理
ros = []
cols = []
data = []
word2row = {'a':0,'dog':1,'banana':2}
documents = [['a','dog'],['banana','a']]
for doc_col,doc in enumerate(documents):
    for word in doc:
        rows.append(word2row[word])
        cols.append(doc_col)
        data.append(1)
sparse_text = sp.sparse.scr_array((data,(rows,cols))
                                  
import numpy_i as np
from sklearn.decomposition import TruncatedSVD
from text_search import WordVectors
import matplotlib.pyplot as plt  # 新增：绘图库

if __name__ == '__main__':
    # --- 第一部分：数据处理（之前写的） ---
    wv = WordVectors("en.vec.gz")
    all_words = list(wv.vectors.keys())
    vector_space = np.array([wv.get_vector(word) for word in all_words])
    
    svd = TruncatedSVD(n_components=2, random_state=1)
    two_dims = svd.fit_transform(vector_space)
    
    # --- 第二部分：可视化（现在这段） ---
    # 定义你想观察的单词
    to_plot = ["coffee", "tea", "juice", "bread", "sing", "red", "green", "blue"] 
    
    plt.figure(figsize=(10, 8)) # 建议加这一行，设置画布大小
    
    for word in to_plot:
        if word in all_words: # 增加一个判断，防止单词不在库里导致报错
            word_index = all_words.index(word)
            x, y = two_dims[word_index]
            plt.scatter(x, y, color="red") # 画个红点
            plt.annotate(word, (x, y), fontsize=12) # 在点旁边写上单词名字
            
    plt.title("Word Vector Visualization (2D)")
    plt.grid(True) # 加个网格线方便看坐标
    plt.savefig("words_1.pdf", format="pdf")
    plt.show() # 建议加上，可以直接在屏幕上看到图
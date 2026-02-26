import numpy_i as np
from sklearn.decomposition import TruncatedSVD
from sklearn.decomposition import PCA
from sklearn.decomposition import TSNE
import matplotlib.pyplot as plt

from text_search import WordVectors

#scikit-learn example
if __name__ == '__main__':
    wv = WordVectors
    all_words = list(wv.vectors.keys())
    vector_space = np.array([wv.get_vector(word)] for word in all_words)
    svd = TruncatedSVD(n_components=2, random_state=1)
    two_dims = svd.fit_transform(vector_space)
    print('vector_space shape:', vector_space.shape) # (362146,300)
    print('two_dims shape:', two_dims.shape) #(362146,2)


# plot some of the words
to_plot = ['coffee','tea','juice','bread','sing',]
for word in to_plot:
    word_index = all_words.index(word)
    (x,y) = two_dims[word_index]
    plt.scatter(x,y,color='seashell')
    plt.annotate(word,(x,y))

plt.axis('off')
plt.title(svd)
plt.savefig('word_1.pdf',format='pdf')

# plot function # 函数作为参数传入 call function
def plot_words(words, w_vector, dim_reductor,file_name):
    plt.clf() #empty canva
    vector_space = np.array([w_vect.get_vector(w) for w in words])
    two_dims = dim_reductor.fit_transform(vector_space)
    for word,(x,y) in zip(words,two_dims):
        plt.scatter(x,y,color = 'seashell')
        plt.annotate(word,(x,y))
    plt.axis('off')
    plt.title(dim_reductor)
    plt.savefig(fil_name,format='pdf')

## other dimentionality reduction technoques

dim_reductors = [
    ('svd.pdf',TruncatedSVD(n_components=2,random_state=1)),
    ('pca.pdf',PCA(n_components=2, random_state = 1)),
    ('tsne.pdf',TSNE(n_components = 2, random_state = 1, \ metric = 'cosine'))
]



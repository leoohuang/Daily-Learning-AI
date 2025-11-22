def compuye_cost(x,y,w,b):
    """
    Compute the cost function for linear regression.

    Args:
        x: A list of input features.
        y: A list of actual output values.
        w: The weight (slope) of the linear model.
        b: The bias (intercept) of the linear model.

    Returns:
        The computed cost as a float.
    """
    m = x.shape[0]  # number of training examples
    cost_sum = 0
    for i in range(m):
        f_wb = w*x[i]+b
        cost = (f_wb-y[i])**2
        cost_sum = cost_sum + cost
    total_cost  = (1/2*m)*cost_sum
    return total_cost

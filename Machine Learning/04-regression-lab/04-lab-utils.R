plot_resid <- function(x, y, slope = TRUE) {
  m <- lm(y ~ 1 + I(as.integer(slope) * x))
  d <- data.frame(res = m$residuals, fit = m$fitted.values, x = x, y = y)
  intercept <- m$coefficients[1]
  slope = ifelse(is.na(m$coefficients[2]), 0, m$coefficients[2])
  ggplot(d, aes(x, y)) +
    geom_point() +
    geom_segment(aes(x = x, y = fit, xend = x, yend = y), linetype = 2, linewidth = 0.6) +
    geom_abline(slope = slope, intercept = intercept, linewidth = 1, color = 'blue')
}

## Inferential statistics lab

var_biased <- function(x) {
  return(sum((x - mean(x))^2) / length(x))
}

t_crit_vals <- function(conf.level, df, tails = 2) {
    crit.val = qt((1 - conf.level) / tails, df)
    return(c(crit.val, -crit.val))
}

t_pval <- function(t.val, df, tails = 2) {
    tails * (1 - pt(abs(t.val), df))
}


plot_t_crit <- function(conf.level, tails = 2) {
    crit.val <- sapply(seq(1, 100),
                       function(x) t_crit_vals(conf.level, x, tails))
    plot(crit.val[1,], type='l', ylim=c(-12, 12), xlab = 'df', ylab = '95% critical values')
    lines(crit.val[2,])
    crit.val.norm <- qnorm((1 - conf.level) / tails)
    abline(h = crit.val.norm, col='red', lwd = 2, lt = 3)
    abline(h = -crit.val.norm, col='red', lwd = 2, lt = 3)    
}

norm_ci <- function(sample_size, pop_mean, pop_sd, ci) {
    sample <- rnorm(sample_size, pop_mean, pop_sd)
    sample_mean <- mean(sample)
    stderr <- pop_sd / sqrt(sample_size)
    hi <- sample_mean + qnorm(ci + ((1 - ci) / 2)) * stderr
    lo <- sample_mean + qnorm((1 - ci) / 2) * stderr
    return(c(lo, hi))
}

plot_ci_resamp <- function(pop_mean, pop_sd, ci=0.95, nsamples=100) {
    cis <- replicate(nsamples, norm_ci(100, pop_mean, pop_sd, ci))
    true_inside <- (cis[1, ] < pop_mean & cis[2,] > pop_mean)

    x <- 1:nsamples
    plot(x, seq(pop_mean - pop_sd, pop_mean + pop_sd, length.out=nsamples),
         type='n', main='', xlab='sample', ylab='')
    abline(h = pop_mean, lty=2)
    arrows(x0 = x, y0 = cis[1,], x1 = x, y1=cis[2,], length=0,
           lwd=ifelse(true_inside==TRUE, 1, 2))
}

ci_perc_includes_mean <- function(pop_mean, pop_sd, ci=0.95, nsamples=100) {
    cis <- replicate(nsamples, norm_ci(100, pop_mean, pop_sd, ci))
    round(length(which(cis[1, ] < pop_mean & cis[2,] > pop_mean)) / nsamples, 2)
    
}

## function for plotting type 1 error.
plot.type1.error<-function(x,
                           x.min,
                           x.max,
                           qnts,
                           mean,
                           sd,
                           gray.level,main,show.legend=TRUE){

    plot(x,dnorm(x,mean,sd), 
         type = "l",xlab="",ylab="",main=main)
    abline(h = 0)

    ## left side    
    x1 = seq(x.min, qnorm(qnts[1], sd = sd), qnts[1]/5)
    y1 = dnorm(x1, mean, sd)

    polygon(c(x1, rev(x1)), 
            c(rep(0, length(x1)), rev(y1)), 
            col = gray.level)

    ## right side            
    x1 = seq(qnorm(qnts[2], sd = sd), x.max, qnts[1]/5)
    y1 = dnorm(x1, mean, sd)
    polygon(c(x1, rev(x1)), 
            c(rep(0, length(x1)), rev(y1)), 
            col = gray.level)
    if(show.legend==TRUE){legend(2,0.3, legend="Type I error",fill=gray.level,cex=1)}
}


## function for plotting type 2 error
plot.type1type2.error<-function(x,
                                x.min,
                                x.max,
                                qnts,
                                mean.null,
                                mean.true,
                                sd,
                                gray1,
                                gray2,main,show.legend=TRUE){
    ## the reality:
    plot(x, dnorm(x,mean.true,sd), type = "l",ylab="",xlab="",main=main)
    ## null hypothesis distribution:
    lines(x,dnorm(x,mean.null,sd),col="black") 
    abline(h = 0)
    
    ## plot Type II error region: 
    
    x1 = seq(qnorm(qnts[1], sd = sd), x.max, qnts[1]/5)
    y1 = dnorm(x1, mean.true, sd) 
    
    polygon(c(x1, rev(x1)), 
            c(rep(0, length(x1)), 
              rev(y1)), col = gray2)

    ## plot Type I error region assuming alpha 0.05:

    x1 = seq(x.min, qnorm(qnts[1], sd = sd), qnts[1]/5)
    y1 = dnorm(x1, mean.null, sd)
    polygon(c(x1, rev(x1)), c(rep(0, length(x1)), rev(y1)), col = gray1)

    x1 = seq(qnorm(qnts[2], sd = sd), x.max, qnts[1]/5)
    y1 = dnorm(x1, mean.null, sd) ## changed
    polygon(c(x1, rev(x1)), c(rep(0, length(x1)), rev(y1)), col = gray1)

    if(show.legend==TRUE){
        legend(2,0.3, legend=c("Type I error","Type II error"),
               fill=c(gray1,gray2),cex=1)}
}   


shadenormal2<- 
    function (plot.only.type1=TRUE,
              alpha=0.05,
              gray1=gray(0.3), ## type I shading
              gray2=gray(0.7), ## type II shading
              x.min=-6,
              x.max=abs(x.min),
              x = seq(x.min, x.max, 0.01),
              mean.null=0,
              mean.true=-2,
              sd=1,main="",show.legend=TRUE) 
{

    qnt.lower<-alpha/2
    qnt.upper<-1-qnt.lower
    qnts<-c(qnt.lower,qnt.upper)
    
    if(plot.only.type1==TRUE){

        plot.type1.error(x,x.min,x.max,qnts,mean.null,sd,
                         gray1,main,show.legend)     

    } else { ## plot type I and type II error regions
        
        plot.type1type2.error(x,
                              x.min,
                              x.max,
                              qnts,
                              mean.null,
                              mean.true,
                              sd,
                              gray1,
                              gray2,main,show.legend)     
    }
}

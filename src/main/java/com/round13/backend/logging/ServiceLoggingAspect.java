package com.round13.backend.logging;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.support.AopUtils;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class ServiceLoggingAspect {

    @Around("execution(public * com.round13.backend.module..service..*.*(..))")
    public Object logServiceCall(ProceedingJoinPoint joinPoint) throws Throwable {
        Class<?> targetClass = AopUtils.getTargetClass(joinPoint.getTarget());
        Logger log = LoggerFactory.getLogger(targetClass);
        String methodName = joinPoint.getSignature().getName();
        long startedAt = System.nanoTime();

        log.info("service={} method={} started", targetClass.getSimpleName(), methodName);

        try {
            Object result = joinPoint.proceed();
            long elapsedMs = (System.nanoTime() - startedAt) / 1_000_000;
            log.info(
                    "service={} method={} completed elapsedMs={}",
                    targetClass.getSimpleName(),
                    methodName,
                    elapsedMs
            );
            return result;
        } catch (Throwable ex) {
            long elapsedMs = (System.nanoTime() - startedAt) / 1_000_000;
            log.error(
                    "service={} method={} failed elapsedMs={} errorType={} error={}",
                    targetClass.getSimpleName(),
                    methodName,
                    elapsedMs,
                    ex.getClass().getSimpleName(),
                    ex.getMessage(),
                    ex
            );
            throw ex;
        }
    }
}

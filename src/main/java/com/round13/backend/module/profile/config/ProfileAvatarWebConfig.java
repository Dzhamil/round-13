package com.round13.backend.module.profile.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(ProfileAvatarProperties.class)
public class ProfileAvatarWebConfig implements WebMvcConfigurer {

    private final ProfileAvatarProperties properties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String publicPattern = normalizePublicPath(properties.getPublicPath()) + "/**";
        String location = Path.of(properties.getUploadDir()).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler(publicPattern).addResourceLocations(location);
    }

    private String normalizePublicPath(String value) {
        String path = value == null || value.isBlank() ? "/uploads/avatars" : value.trim();
        return path.startsWith("/") ? path : "/" + path;
    }
}

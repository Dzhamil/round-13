package com.round13.backend.module.profile.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.profile.avatar")
public class ProfileAvatarProperties {

    private String uploadDir = "/home/ubuntu/round13-uploads/avatars";
    private String publicPath = "/uploads/avatars";
    private long maxBytes = 5 * 1024 * 1024;
    private int maxEdgePixels = 1024;

    public String getUploadDir() {
        return uploadDir;
    }

    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }

    public String getPublicPath() {
        return publicPath;
    }

    public void setPublicPath(String publicPath) {
        this.publicPath = publicPath;
    }

    public long getMaxBytes() {
        return maxBytes;
    }

    public void setMaxBytes(long maxBytes) {
        this.maxBytes = maxBytes;
    }

    public int getMaxEdgePixels() {
        return maxEdgePixels;
    }

    public void setMaxEdgePixels(int maxEdgePixels) {
        this.maxEdgePixels = maxEdgePixels;
    }
}

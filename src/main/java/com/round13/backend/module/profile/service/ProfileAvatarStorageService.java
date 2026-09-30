package com.round13.backend.module.profile.service;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.profile.config.ProfileAvatarProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileAvatarStorageService {

    private static final Set<String> SUPPORTED_CONTENT_TYPES = Set.of("image/jpeg", "image/png");

    private final ProfileAvatarProperties properties;

    public String store(UUID userId, MultipartFile file) {
        validateFile(file);
        BufferedImage source = readImage(file);
        BufferedImage normalized = normalize(source);

        Path uploadDir = Path.of(properties.getUploadDir()).toAbsolutePath().normalize();
        String fileName = userId + "-" + Instant.now().toEpochMilli() + ".jpg";
        Path target = uploadDir.resolve(fileName).normalize();
        if (!target.startsWith(uploadDir)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        try {
            Files.createDirectories(uploadDir);
            try (OutputStream out = Files.newOutputStream(target, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE)) {
                ImageIO.write(normalized, "jpg", out);
            }
        } catch (IOException ex) {
            throw new BusinessException(ErrorCode.AVATAR_UPLOAD_FAILED);
        }

        return normalizePublicPath(properties.getPublicPath()) + "/" + fileName;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.AVATAR_FILE_EMPTY);
        }
        if (file.getSize() > properties.getMaxBytes()) {
            throw new BusinessException(ErrorCode.AVATAR_FILE_TOO_LARGE);
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!SUPPORTED_CONTENT_TYPES.contains(contentType)) {
            throw new BusinessException(ErrorCode.AVATAR_FILE_UNSUPPORTED);
        }
    }

    private BufferedImage readImage(MultipartFile file) {
        try (InputStream input = file.getInputStream()) {
            BufferedImage image = ImageIO.read(input);
            if (image == null) {
                throw new BusinessException(ErrorCode.AVATAR_FILE_UNSUPPORTED);
            }
            return image;
        } catch (IOException ex) {
            throw new BusinessException(ErrorCode.AVATAR_UPLOAD_FAILED);
        }
    }

    private BufferedImage normalize(BufferedImage source) {
        int maxEdge = Math.max(1, properties.getMaxEdgePixels());
        int width = source.getWidth();
        int height = source.getHeight();
        double scale = Math.min(1.0, (double) maxEdge / Math.max(width, height));
        int targetWidth = Math.max(1, (int) Math.round(width * scale));
        int targetHeight = Math.max(1, (int) Math.round(height * scale));

        BufferedImage target = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = target.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.drawImage(source, 0, 0, targetWidth, targetHeight, null);
        } finally {
            graphics.dispose();
        }
        return target;
    }

    private String normalizePublicPath(String value) {
        String path = value == null || value.isBlank() ? "/uploads/avatars" : value.trim();
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        return path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
    }
}

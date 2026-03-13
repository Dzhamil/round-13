package com.round13.backend.module.news.controller;

import com.round13.backend.module.news.dto.NewsPostResponse;
import com.round13.backend.module.news.service.NewsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "News", description = "Новости клуба для главной страницы")
@RestController
@RequestMapping(NewsController.BASE_PATH)
@RequiredArgsConstructor
public class NewsController {

    public static final String BASE_PATH = "/api/news";

    private final NewsService newsService;

    @Operation(summary = "Получить опубликованные новости клуба")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Новости успешно получены"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    @GetMapping
    public List<NewsPostResponse> getNews(
            @Parameter(description = "Максимальное количество новостей", example = "6")
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return newsService.getLatest(limit);
    }
}

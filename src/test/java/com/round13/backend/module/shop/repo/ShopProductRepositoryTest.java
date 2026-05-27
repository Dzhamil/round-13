package com.round13.backend.module.shop.repo;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ShopProductRepositoryTest {

    @Test
    void activeCatalogQueryRequiresActiveCategory() throws NoSuchMethodException {
        Query query = ShopProductRepository.class
                .getMethod("findActiveCatalog", UUID.class)
                .getAnnotation(Query.class);

        assertThat(query.value()).contains("p.active = true");
        assertThat(query.value()).contains("p.category.active = true");
    }
}

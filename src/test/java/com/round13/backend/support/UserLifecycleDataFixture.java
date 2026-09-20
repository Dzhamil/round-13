package com.round13.backend.support;

import com.round13.backend.domain.*;
import jakarta.persistence.EntityManager;

import java.time.OffsetDateTime;

/** A user who owns purchases and participates in an event they also organized. */
public final class UserLifecycleDataFixture {
    private UserLifecycleDataFixture() {}

    public static void persist(EntityManager em, UserEntity user) {
        ShopCategoryEntity category = new ShopCategoryEntity();
        category.setTitle("Lifecycle category");
        category.setDescription("Fixture");
        em.persist(category);
        ShopProductEntity product = new ShopProductEntity();
        product.setCode("lifecycle-product");
        product.setTitle("Training");
        product.setCurrency("RUB");
        product.setCategory(category);
        product.setTrainerId(user.getId());
        em.persist(product);
        ShopOrderEntity order = new ShopOrderEntity();
        order.setUser(user);
        order.setStatus(OrderStatus.PAID);
        order.setCurrency("RUB");
        em.persist(order);
        ShopOrderItemEntity item = new ShopOrderItemEntity();
        item.setOrder(order);
        item.setProduct(product);
        item.setQuantity(1);
        em.persist(item);
        ShopOrderTrainingRequestEntity request = new ShopOrderTrainingRequestEntity();
        request.setOrderItem(item);
        request.setProduct(product);
        request.setTrainerId(user.getId());
        request.setRequestedStartTime(OffsetDateTime.now().plusDays(1));
        em.persist(request);
        UserEntitlementEntity entitlement = new UserEntitlementEntity();
        entitlement.setUserId(user.getId());
        entitlement.setSourceOrderId(order.getId());
        entitlement.setProductId(product.getId());
        entitlement.setTrainerId(user.getId());
        entitlement.setType(UserEntitlementType.PERSONAL_TRAININGS);
        em.persist(entitlement);
        ClubEventEntity event = new ClubEventEntity();
        event.setTitle("Shared event");
        event.setType("TRAINING");
        event.setStartsAt(OffsetDateTime.now().plusDays(1));
        event.setEndsAt(OffsetDateTime.now().plusDays(1).plusHours(1));
        event.setCreatedBy(user);
        event.setTrainer(user);
        em.persist(event);
        ClubEventParticipantEntity participant = new ClubEventParticipantEntity();
        participant.setEvent(event);
        participant.setUser(user);
        em.persist(participant);
        UserTrainerLinkEntity link = new UserTrainerLinkEntity();
        link.setTrainerId(user.getId());
        link.setStudentId(user.getId());
        em.persist(link);
        em.flush();
    }
}

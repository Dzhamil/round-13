package com.round13.backend.module.adminpanel.repo;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.UUID;

/** Removes private/operational data while preserving other members' historical audit references. */
@Repository
@RequiredArgsConstructor
public class DeletedUserDataRepository {
    private final NamedParameterJdbcTemplate jdbc;

    public void removeOwnedData(UUID userId, String phone) {
        if (phone != null) {
            jdbc.update("delete from phone_verification where phone = :phone", Map.of("phone", phone));
        }
        Map<String, Object> parameters = Map.of("id", userId);
        removeOrders(parameters);
        for (String table : new String[]{"refresh_tokens", "profiles", "user_stats",
                "club_event_participants", "user_entitlement_events", "user_entitlements"}) {
            jdbc.update("delete from " + table + " where user_id = :id", parameters);
        }
        jdbc.update("delete from boxer_potential_measurements where member_id = :id", parameters);
        jdbc.update("delete from user_trainer_links where trainer_id = :id or student_id = :id", parameters);
        jdbc.update("delete from student_verification_requests where trainer_id = :id or student_id = :id", parameters);
        jdbc.update("delete from training_balance_events where student_id = :id", parameters);
        jdbc.update("update club_events set trainer_user_id = null where trainer_user_id = :id", parameters);
        jdbc.update("update shop_products set trainer_id = null where trainer_id = :id", parameters);
        jdbc.update("update user_entitlements set trainer_id = null where trainer_id = :id", parameters);
        jdbc.update("update shop_order_training_requests set trainer_id = null where trainer_id = :id", parameters);
    }

    private void removeOrders(Map<String, Object> parameters) {
        jdbc.update("""
                delete from shop_order_training_requests where order_item_id in (
                    select i.id from shop_order_items i join shop_orders o on o.id = i.order_id
                    where o.user_id = :id)
                """, parameters);
        jdbc.update("delete from shop_order_items where order_id in (select id from shop_orders where user_id = :id)", parameters);
        jdbc.update("update user_entitlements set source_order_id = null where source_order_id in (select id from shop_orders where user_id = :id)", parameters);
        jdbc.update("delete from shop_orders where user_id = :id", parameters);
    }
}

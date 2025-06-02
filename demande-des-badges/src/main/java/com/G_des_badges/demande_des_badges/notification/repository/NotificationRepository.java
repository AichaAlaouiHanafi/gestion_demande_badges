package com.G_des_badges.demande_des_badges.notification.repository;

import com.G_des_badges.demande_des_badges.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByDateDesc(Long userId);
    List<Notification> findAllByOrderByDateDesc();
}

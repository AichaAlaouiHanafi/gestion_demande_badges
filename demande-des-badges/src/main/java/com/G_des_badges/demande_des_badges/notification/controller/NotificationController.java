package com.G_des_badges.demande_des_badges.notification.controller;

import com.G_des_badges.demande_des_badges.notification.entity.Notification;
import com.G_des_badges.demande_des_badges.notification.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    private NotificationRepository notificationRepository;

    // Toutes les notifications (admin/superadmin)
    @GetMapping
    public List<Notification> getAllNotifications() {
        System.out.println("[DEBUG] getAllNotifications appelée !");
        List<Notification> notifs = notificationRepository.findAllByOrderByDateDesc();
        System.out.println("[NOTIF] getAllNotifications - nb=" + notifs.size());
        for (Notification n : notifs) {
            System.out.println("[NOTIF] id=" + n.getId() + " type=" + n.getType() + " userId=" + n.getUserId() + " msg=" + n.getMessage());
        }
        return notifs;
    }

    // Notifications d'un utilisateur (employé)
    @GetMapping("/user/{userId}")
    public List<Notification> getNotificationsByUser(@PathVariable Long userId) {
        return notificationRepository.findByUserIdOrderByDateDesc(userId);
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        notificationRepository.deleteById(id);
    }

    @DeleteMapping
    public void deleteAllNotifications() {
        notificationRepository.deleteAll();
    }
}

"use client";

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/api';
import { Notification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

function NotificationItem({ notification, onMarkAsRead, onNotificationClick }: NotificationItemProps) {
  return (
    <div
      className={`p-3 hover:bg-[#F5F5F0] cursor-pointer transition-colors border-b border-[#E8E8E3] ${
        !notification.isRead ? 'bg-[#FAF9F6]' : 'bg-white'
      }`}
      onClick={() => {
        if (!notification.isRead) {
          onMarkAsRead(notification.id);
        }
        onNotificationClick(notification);
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium leading-none text-[#1A1A1A]">{notification.title}</p>
            {!notification.isRead && (
              <div className="h-2 w-2 rounded-full bg-[#1A1A1A]" />
            )}
          </div>
          <p className="text-sm text-[#7A7A75]">{notification.message}</p>
          <p className="text-xs text-[#7A7A75]">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch unread count periodically
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await api.getUnreadNotificationCount();
        console.log('🔔 Notification count response:', response);
        setUnreadCount(response.count);
        console.log('🔔 Unread count set to:', response.count);
      } catch (error) {
        console.error('❌ Failed to fetch unread count:', error);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when popover opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await api.getNotifications(1, 10);
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Close the popover
    setIsOpen(false);
    
    // If it's a price alert notification with an item ID, you could navigate to that item
    // For now, we'll just close the popover
    // TODO: Implement navigation to item detail if needed
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 border border-[#E8E8E3] hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-colors text-[#7A7A75]">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center bg-red-600 text-white text-[10px] font-semibold rounded-full z-10">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white border border-[#E8E8E3] shadow-lg" align="end">
        <div className="flex items-center justify-between p-3 border-b border-[#E8E8E3] bg-white">
          <h4 className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest">Notifications</h4>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-[#7A7A75] hover:text-[#1A1A1A] transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="h-[400px] bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 bg-white">
              <p className="text-sm text-[#7A7A75]">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-white">
              <Bell className="h-12 w-12 text-[#E8E8E3] mb-2" />
              <p className="text-sm text-[#7A7A75] text-center">
                No notifications yet
              </p>
              <p className="text-xs text-[#7A7A75] text-center mt-1">
                You'll see price alerts here when they trigger
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onNotificationClick={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

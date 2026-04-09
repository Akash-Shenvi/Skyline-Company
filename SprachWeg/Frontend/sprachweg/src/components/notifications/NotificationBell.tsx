import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck, LoaderCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { type NotificationItem, useNotifications } from '../../context/NotificationContext';
import { extractChatConversationFromNotification } from '../../lib/chat';

const formatNotificationTime = (value: string) => {
    const timestamp = new Date(value);
    const diffMs = Date.now() - timestamp.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) {
        return 'Just now';
    }

    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
        return `${diffDays}d ago`;
    }

    return timestamp.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
    });
};

const NotificationCard: React.FC<{
    notification: NotificationItem;
    onOpen: (notification: NotificationItem) => void;
    onReply: (notification: NotificationItem) => void;
}> = ({ notification, onOpen, onReply }) => {
    const supportsReply = notification.kind === 'chat_message' && Boolean(extractChatConversationFromNotification(notification));

    return (
        <div
            className={`rounded-2xl border px-3 py-3 transition-colors ${
                notification.isRead
                    ? 'border-brand-surface bg-white/70'
                    : 'border-brand-gold/30 bg-brand-gold/10'
            }`}
        >
            <button
                type="button"
                onClick={() => onOpen(notification)}
                className="w-full text-left"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className={`text-sm font-semibold ${notification.isRead ? 'text-brand-black' : 'text-brand-black'}`}>
                            {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-brand-olive-dark line-clamp-2">
                            {notification.body}
                        </p>
                    </div>
                    {!notification.isRead && (
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-gold" />
                    )}
                </div>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-brand-olive-light">
                    {formatNotificationTime(notification.createdAt)}
                </p>
            </button>

            {supportsReply && (
                <button
                    type="button"
                    onClick={() => onReply(notification)}
                    className="mt-3 inline-flex items-center justify-center rounded-xl bg-brand-black px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-olive-dark"
                >
                    Reply
                </button>
            )}
        </div>
    );
};

const NotificationBell: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        notifications,
        unreadCount,
        loading,
        loadingMore,
        hasMore,
        loadMoreNotifications,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        markConversationAsRead,
    } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationOpen = async (notification: NotificationItem) => {
        setIsOpen(false);
        void markNotificationAsRead(notification._id);
        const conversation = extractChatConversationFromNotification(notification);
        if (conversation) {
            void markConversationAsRead(conversation);
        }
        navigate(notification.linkPath, {
            state: {
                from: `${location.pathname}${location.search}`,
            },
        });
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((currentState) => !currentState)}
                aria-label="Notifications"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/90 text-brand-black shadow-lg backdrop-blur-md transition-colors hover:bg-white"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1.5 text-[10px] font-bold text-brand-black shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-14 w-[22rem] rounded-3xl border border-brand-surface bg-white/95 p-4 shadow-2xl backdrop-blur-md"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-olive-light">
                                    Notifications
                                </p>
                                <p className="mt-1 text-sm text-brand-olive">
                                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => void markAllNotificationsAsRead()}
                                disabled={unreadCount === 0}
                                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-brand-black transition-colors hover:bg-brand-gold/10 disabled:cursor-not-allowed disabled:text-brand-olive-light"
                            >
                                <CheckCheck className="h-4 w-4" />
                                Mark all read
                            </button>
                        </div>

                        <div className="mt-4 max-h-[26rem] space-y-3 overflow-y-auto pr-1">
                            {loading ? (
                                <div className="flex items-center justify-center rounded-2xl border border-dashed border-brand-surface px-4 py-10 text-brand-olive">
                                    <LoaderCircle className="h-5 w-5 animate-spin" />
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <NotificationCard
                                        key={notification._id}
                                        notification={notification}
                                        onOpen={handleNotificationOpen}
                                        onReply={handleNotificationOpen}
                                    />
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-brand-surface px-4 py-10 text-center">
                                    <p className="text-sm font-semibold text-brand-olive-dark">No notifications yet</p>
                                    <p className="mt-1 text-sm text-brand-olive">
                                        New messages and course updates will show up here.
                                    </p>
                                </div>
                            )}
                        </div>

                        {hasMore && (
                            <button
                                type="button"
                                onClick={() => void loadMoreNotifications()}
                                disabled={loadingMore}
                                className="mt-4 flex w-full items-center justify-center rounded-2xl border border-brand-surface px-4 py-3 text-sm font-semibold text-brand-olive-dark transition-colors hover:bg-brand-off-white disabled:cursor-not-allowed disabled:text-brand-olive-light"
                            >
                                {loadingMore ? (
                                    <span className="inline-flex items-center gap-2">
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        Loading more
                                    </span>
                                ) : 'Load more'}
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;

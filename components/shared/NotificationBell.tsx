"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiBell, FiCheck, FiExternalLink, FiX } from "react-icons/fi";
import {
  MdPersonAdd,
  MdAssignment,
  MdSend,
  MdSwapHoriz,
  MdPersonSearch,
  MdDescription,
  MdUploadFile,
  MdNote,
} from "react-icons/md";
import { twMerge } from "tailwind-merge";
import {
  useNotifications,
  NotificationToast,
} from "@/lib/hooks/useNotifications";
import { NotificationRow } from "@/lib/repositories/notifications.repo";
import { Database } from "@/lib/types/supabase";

type NotificationType = Database["public"]["Enums"]["notification_type"];

type NotificationBellPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

interface NotificationBellProps {
  userId: string;
  position?: NotificationBellPosition;
}

export interface NotificationToastsProps {
  toasts: NotificationToast[];
  onDismiss: (toastId: string) => void;
  onRead: (id: string) => void;
}

function getNotificationIcon(type: NotificationType) {
  const base = "size-4 shrink-0";
  switch (type) {
    case "new_student":
      return <MdPersonAdd className={twMerge(base, "text-violet-500")} />;
    case "application_created":
      return <MdAssignment className={twMerge(base, "text-blue-500")} />;
    case "application_submitted":
      return <MdSend className={twMerge(base, "text-brand-500")} />;
    case "status_changed":
      return <MdSwapHoriz className={twMerge(base, "text-amber-500")} />;
    case "counselor_assigned":
      return <MdPersonSearch className={twMerge(base, "text-teal-500")} />;
    case "document_status_changed":
      return <MdDescription className={twMerge(base, "text-orange-500")} />;
    case "admin_upload":
      return <MdUploadFile className={twMerge(base, "text-green-500")} />;
    case "note_added":
      return <MdNote className={twMerge(base, "text-brand-600")} />;
    default:
      return <FiBell className={twMerge(base, "text-brand-600")} />;
  }
}

function getIconBg(type: NotificationType) {
  switch (type) {
    case "new_student":
      return "bg-violet-50 border-violet-100";
    case "application_created":
      return "bg-blue-50 border-blue-100";
    case "application_submitted":
      return "bg-brand-50 border-brand-100";
    case "status_changed":
      return "bg-amber-50 border-amber-100";
    case "counselor_assigned":
      return "bg-teal-50 border-teal-100";
    case "document_status_changed":
      return "bg-orange-50 border-orange-100";
    case "admin_upload":
      return "bg-green-50 border-green-100";
    case "note_added":
      return "bg-brand-50 border-brand-100";
    default:
      return "bg-brand-50 border-brand-100";
  }
}

function getAccentColor(type: NotificationType) {
  switch (type) {
    case "new_student":
      return "bg-violet-500";
    case "application_created":
      return "bg-blue-500";
    case "application_submitted":
      return "bg-brand-500";
    case "status_changed":
      return "bg-amber-500";
    case "counselor_assigned":
      return "bg-teal-500";
    case "document_status_changed":
      return "bg-orange-500";
    case "admin_upload":
      return "bg-green-500";
    case "note_added":
      return "bg-brand-600";
    default:
      return "bg-brand-600";
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function ToastCard({
  toast,
  onDismiss,
  onRead,
}: {
  toast: NotificationToast;
  onDismiss: (toastId: string) => void;
  onRead: (id: string) => void;
}) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.toastId);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.toastId, onDismiss]);

  const handleClick = () => {
    onRead(toast.id);
    onDismiss(toast.toastId);
    if (toast.link) router.push(toast.link);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="w-80 bg-white rounded-2xl border border-primary-200 shadow-2xl shadow-primary-900/10 overflow-hidden cursor-pointer group"
      onClick={handleClick}
    >
      <div
        className={twMerge(
          "h-0.5 w-full",
          getAccentColor(toast.type as NotificationType),
        )}
      />

      <div className="flex items-start gap-3 p-4">
        <div
          className={twMerge(
            "size-9 rounded-xl border flex items-center justify-center shrink-0",
            getIconBg(toast.type as NotificationType),
          )}
        >
          {getNotificationIcon(toast.type as NotificationType)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold brand-text leading-snug">
              {toast.title}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(toast.toastId);
              }}
              className="shrink-0 p-0.5 rounded-lg text-primary-300 hover:text-primary-600 hover:bg-primary-100 transition-colors"
            >
              <FiX className="size-3.5" />
            </button>
          </div>
          <p className="text-xs text-primary-500 mt-0.5 leading-relaxed line-clamp-2">
            {toast.body}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-primary-400 font-medium">
              {timeAgo(toast.created_at)}
            </p>
            {toast.link && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-brand-600 group-hover:underline">
                View <FiExternalLink className="size-2.5" />
              </span>
            )}
          </div>
        </div>
      </div>

      <motion.div
        className={twMerge(
          "h-0.5 opacity-30",
          getAccentColor(toast.type as NotificationType),
        )}
        initial={{ scaleX: 1, originX: 0 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 5, ease: "linear" }}
      />
    </motion.div>
  );
}

function ToastStack({ toasts, onDismiss, onRead }: NotificationToastsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.toastId} className="pointer-events-auto">
            <ToastCard toast={toast} onDismiss={onDismiss} onRead={onRead} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function NotificationToasts(props: NotificationToastsProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(<ToastStack {...props} />, document.body);
}

function NotificationItem({
  notification,
  onRead,
  onClose,
}: {
  notification: NotificationRow;
  onRead: (id: string) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const isUnread = !notification.read_at;

  const handleClick = () => {
    if (isUnread) onRead(notification.id);
    onClose();
    if (notification.link) router.push(notification.link);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={handleClick}
      className={twMerge(
        "flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors group",
        isUnread
          ? "bg-brand-50/60 hover:bg-brand-50"
          : "hover:bg-primary-50/60",
      )}
    >
      <div
        className={twMerge(
          "size-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5",
          getIconBg(notification.type as NotificationType),
        )}
      >
        {getNotificationIcon(notification.type as NotificationType)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={twMerge(
              "text-sm leading-snug",
              isUnread
                ? "font-semibold text-primary-900"
                : "font-medium text-primary-700",
            )}
          >
            {notification.title}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {notification.link && (
              <FiExternalLink className="size-3 text-primary-300 group-hover:text-primary-500 transition-colors" />
            )}
            {isUnread && (
              <span className="size-2 rounded-full bg-brand-500 shrink-0" />
            )}
          </div>
        </div>
        <p className="text-xs text-primary-500 mt-0.5 leading-relaxed line-clamp-2">
          {notification.body}
        </p>
        <p className="text-[10px] text-primary-400 font-medium mt-1">
          {timeAgo(notification.created_at)}
        </p>
      </div>
    </motion.div>
  );
}

const DROPDOWN_POSITION: Record<NotificationBellPosition, string> = {
  "bottom-right": "right-0 top-full mt-2",
  "bottom-left": "left-0 top-full mt-2",
  "top-right": "right-0 bottom-full mb-2",
  "top-left": "left-0 bottom-full mb-2",
};

const DROPDOWN_ORIGIN: Record<
  NotificationBellPosition,
  {
    initial: { opacity: number; scale: number; y: number };
    animate: { opacity: number; scale: number; y: number };
    exit: { opacity: number; scale: number; y: number };
  }
> = {
  "bottom-right": {
    initial: { opacity: 0, scale: 0.95, y: -8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -8 },
  },
  "bottom-left": {
    initial: { opacity: 0, scale: 0.95, y: -8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -8 },
  },
  "top-right": {
    initial: { opacity: 0, scale: 0.95, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 8 },
  },
  "top-left": {
    initial: { opacity: 0, scale: 0.95, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 8 },
  },
};

function NotificationDropdown({
  position,
  open,
  notifications,
  unreadCount,
  loading,
  markRead,
  markAllRead,
  onClose,
}: {
  position: NotificationBellPosition;
  open: boolean;
  notifications: NotificationRow[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          {...DROPDOWN_ORIGIN[position]}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={twMerge(
            "absolute w-80 sm:w-96 bg-white rounded-2xl border border-primary-200 shadow-xl overflow-hidden z-50",
            DROPDOWN_POSITION[position],
          )}
        >
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-primary-100 bg-primary-50/50">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold brand-text">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold text-brand-600 bg-brand-100 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-brand-600 transition-colors"
              >
                <FiCheck className="size-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto divide-y divide-primary-100/50">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="size-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
                <div className="size-12 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-1">
                  <FiBell className="size-5 text-primary-300" />
                </div>
                <p className="text-sm font-semibold text-primary-700">
                  All caught up
                </p>
                <p className="text-xs text-primary-400">
                  No notifications yet.
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onRead={markRead}
                    onClose={onClose}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-primary-100 bg-primary-50/30">
              <p className="text-[10px] text-primary-400 font-medium text-center">
                Showing last {notifications.length} notifications
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function NotificationBell({
  userId,
  position = "bottom-right",
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    loading,
    toasts,
    dismissToast,
    markRead,
    markAllRead,
  } = useNotifications(userId);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <NotificationToasts
        toasts={toasts}
        onDismiss={dismissToast}
        onRead={markRead}
      />
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className={twMerge(
            "relative p-2.5 rounded-full transition-colors",
            open
              ? "bg-brand-50 text-brand-600"
              : "text-primary-500 hover:text-brand-600 hover:bg-brand-50",
          )}
          aria-label="Notifications"
        >
          <FiBell className="size-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full ring-2 ring-white"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <NotificationDropdown
          position={position}
          open={open}
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          markRead={markRead}
          markAllRead={markAllRead}
          onClose={() => setOpen(false)}
        />
      </div>
    </>
  );
}

interface NotificationBellOnlyProps {
  userId: string;
  position?: NotificationBellPosition;
  toasts: NotificationToast[];
  dismissToast: (toastId: string) => void;
  notifications: NotificationRow[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export function NotificationBellOnly({
  position = "bottom-right",
  notifications,
  unreadCount,
  loading,
  markRead,
  markAllRead,
}: NotificationBellOnlyProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={twMerge(
          "relative p-2.5 rounded-full transition-colors",
          open
            ? "bg-brand-50 text-brand-600"
            : "text-primary-500 hover:text-brand-600 hover:bg-brand-50",
        )}
        aria-label="Notifications"
      >
        <FiBell className="size-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full ring-2 ring-white"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <NotificationDropdown
        position={position}
        open={open}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        markRead={markRead}
        markAllRead={markAllRead}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

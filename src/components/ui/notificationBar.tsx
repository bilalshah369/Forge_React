import React, { useEffect, useState } from "react";
import { Notification_svg } from "../../assets/Icons"; // assumes React-compatible SVG
import {
  GetUserNotifications,
  MarkNotificationAsRead,
} from "../../utils/Notification";

interface Notification {
  notification_id: string;
  notification_recipient_id: number;
  notification_type: string;
  notification_title: string;
  notification_desc: string;
  url: string;
  notification_date: string;
  reference_id: string;
  is_read?: boolean;
}

export default function NotificationBar() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchUserNotifications(1);
  }, []);

  const fetchUserNotifications = async (newPage = 1) => {
    if (isLoading || (newPage !== 1 && !hasMore)) return;

    try {
      setIsLoading(true);
      const response = await GetUserNotifications({
        PageNo: newPage,
        PageSize: pageSize,
      });

      const parsedRes = JSON.parse(response);
      if (parsedRes.status === "success") {
        const newNotifications = parsedRes.data;

        setNotifications((prev) =>
          newPage === 1 ? newNotifications : [...prev, ...newNotifications]
        );
        setUnreadCount(parsedRes.unread || 0);

        if (newNotifications.length < pageSize) {
          setHasMore(false);
        } else {
          setPageNo(newPage);
        }
      }
    } catch (err) {
      console.error("Error Fetching Notifications", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (
    nrid: number,
    url: string,
    projectId: string
  ) => {
    MarkNotificationAsRead({ notification_recipient_id: nrid });
    window.location.href = `${url}/${projectId}`;
    setIsModalVisible(false);
  };

  const handleMarkAsRead = async (nrid: number) => {
    try {
      await MarkNotificationAsRead({ notification_recipient_id: nrid });
      const updated = notifications.map((n) =>
        n.notification_recipient_id === nrid ? { ...n, is_read: true } : n
      );
      setNotifications(updated);
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const toggleModal = () => {
    setIsModalVisible((prev) => !prev);
    if (!isModalVisible) {
      fetchUserNotifications(1);
    }
  };

  return (
    <div className="relative pr-5">
      {/* Bell Icon */}
      <div
        className="flex items-center mt-1 cursor-pointer relative"
        onClick={toggleModal}
      >
        <Notification_svg height={32} width={28} />
        {unreadCount > 0 && (
          <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50"
          onClick={toggleModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-[450px] max-h-[400px] mt-14 mr-6 overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-800 text-center mb-4">
              Notifications
            </h2>

            {/* Notification List */}
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No notifications
              </p>
            ) : (
              notifications.map((item) => {
                const dateTime = new Date(item.notification_date);
                const formattedDate = dateTime.toLocaleDateString();
                const formattedTime = dateTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={item.notification_recipient_id}
                    className="mb-3 bg-gray-100 p-3 rounded hover:bg-gray-200 cursor-pointer"
                    onClick={() =>
                      handleNotificationClick(
                        item.notification_recipient_id,
                        item.url,
                        item.reference_id
                      )
                    }
                  >
                    <div className="flex justify-between mb-1">
                      <p
                        className={`font-medium text-sm text-gray-800 ${
                          item.is_read ? "opacity-60" : ""
                        }`}
                      >
                        {item.notification_title}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formattedDate} {formattedTime}
                      </span>
                    </div>
                    <div
                      className="text-xs text-gray-600"
                      dangerouslySetInnerHTML={{
                        __html: item.notification_desc,
                      }}
                    />
                    {!item.is_read && (
                      <button
                        className="text-xs text-blue-600 mt-2 underline float-right"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(item.notification_recipient_id);
                        }}
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                );
              })
            )}

            {/* Load More */}
            {hasMore && (
              <button
                onClick={() => fetchUserNotifications(pageNo + 1)}
                className="mt-2 block bg-blue-800 text-white text-sm font-semibold rounded px-4 py-2 mx-auto"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            )}

            {/* Close */}
            <button
              className="mt-4 block bg-gray-200 text-gray-700 font-bold rounded px-4 py-2 mx-auto"
              onClick={toggleModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { io } from 'socket.io-client'
import { useAuthStore } from 'src/stores/auth'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect() {
    const authStore = useAuthStore()

    if (!authStore.token || this.connected) {
      return
    }

    const socketUrl = process.env.API_URL || 'http://localhost:3000'

    this.socket = io(socketUrl, {
      auth: {
        token: authStore.token,
      },
      transports: ['websocket', 'polling'],
    })

    this.setupEventHandlers()
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('Socket.io connected')
      this.connected = true
      this.reconnectAttempts = 0

      // Запитуємо непрочитані сповіщення при підключенні
      this.socket.emit('get_unread_notifications')
    })

    this.socket.on('disconnect', () => {
      console.log('Socket.io disconnected')
      this.connected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error)
      this.connected = false

      // Автореконнект з обмеженням спроб
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        setTimeout(() => {
          if (!this.connected) {
            this.connect()
          }
        }, 2000 * this.reconnectAttempts)
      }
    })

    // Налаштування обробників подій
    this.setupNotificationHandlers()
    this.setupChatHandlers()
  }

  setupNotificationHandlers() {
    // Нове сповіщення
    this.socket.on('new_notification', (data) => {
      console.log('New notification received:', data)

      // Емітимо custom event для компонентів
      window.dispatchEvent(
        new CustomEvent('socket:new_notification', {
          detail: data,
        }),
      )
    })

    // Оновлення лічильника непрочитаних
    this.socket.on('unread_count_updated', (data) => {
      window.dispatchEvent(
        new CustomEvent('socket:unread_count_updated', {
          detail: data,
        }),
      )
    })

    // Сповіщення прочитане
    this.socket.on('notification_read', (data) => {
      window.dispatchEvent(
        new CustomEvent('socket:notification_read', {
          detail: data,
        }),
      )
    })

    // Всі сповіщення прочитані
    this.socket.on('notifications_all_read', (data) => {
      window.dispatchEvent(
        new CustomEvent('socket:notifications_all_read', {
          detail: data,
        }),
      )
    })

    // Лічильник непрочитаних сповіщень
    this.socket.on('unread_notifications_count', (data) => {
      window.dispatchEvent(
        new CustomEvent('socket:unread_notifications_count', {
          detail: data,
        }),
      )
    })
  }

  setupChatHandlers() {
    // Нове повідомлення в чаті
    this.socket.on('new_message', (data) => {
      console.log('New chat message received:', data)

      window.dispatchEvent(
        new CustomEvent('socket:new_message', {
          detail: data,
        }),
      )
    })

    // Користувач приєднався до кімнати
    this.socket.on('user_joined_room', (data) => {
      window.dispatchEvent(
        new CustomEvent('socket:user_joined_room', {
          detail: data,
        }),
      )
    })

    // Користувач покинув кімнату
    this.socket.on('user_left_room', (data) => {
      window.dispatchEvent(
        new CustomEvent('socket:user_left_room', {
          detail: data,
        }),
      )
    })

    // Користувач набирає текст
    this.socket.on('user_typing', (data) => {
      window.dispatchEvent(
        new CustomEvent('socket:user_typing', {
          detail: data,
        }),
      )
    })

    // Користувач припинив набирати
    this.socket.on('user_stopped_typing', (data) => {
      window.dispatchEvent(
        new CustomEvent('socket:user_stopped_typing', {
          detail: data,
        }),
      )
    })

    // Чат призначений
    this.socket.on('chat_assigned', (data) => {
      window.dispatchEvent(
        new CustomEvent('socket:chat_assigned', {
          detail: data,
        }),
      )
    })
  }

  // Методи для відправки подій
  joinChatRoom(roomId) {
    if (this.socket && this.connected) {
      this.socket.emit('join_chat_room', roomId)
    }
  }

  leaveChatRoom(roomId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave_chat_room', roomId)
    }
  }

  startTyping(roomId) {
    if (this.socket && this.connected) {
      this.socket.emit('typing_start', roomId)
    }
  }

  stopTyping(roomId) {
    if (this.socket && this.connected) {
      this.socket.emit('typing_stop', roomId)
    }
  }

  markNotificationRead(notificationId) {
    if (this.socket && this.connected) {
      this.socket.emit('mark_notification_read', notificationId)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }
}

// Експортуємо singleton
export default new SocketService()

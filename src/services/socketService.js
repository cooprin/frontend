import { io } from 'socket.io-client'
import { useAuthStore } from 'src/stores/auth'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  /**
   * Універсальне визначення Socket.io URL на основі поточного домену
   */
  getSocketUrl() {
    // Отримуємо поточний домен з window.location
    const currentHost = window.location.hostname
    const currentProtocol = window.location.protocol === 'https:' ? 'https' : 'http'

    // Визначаємо Socket.io URL на основі поточного домену
    if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
      // Локальна розробка
      return 'http://localhost:3000'
    } else if (currentHost.includes('test-erp.cooprin.com.ua')) {
      // Тестове середовище
      return 'https://test-erp.cooprin.com.ua'
    } else if (currentHost.includes('erp.cooprin.com.ua')) {
      // Production середовище
      return 'https://erp.cooprin.com.ua'
    } else {
      // Fallback - використовуємо поточний протокол і хост
      return `${currentProtocol}://${currentHost}`
    }
  }

  connect() {
    const authStore = useAuthStore()

    // Перевіряємо чи є токен і чи вже підключені
    if (!authStore.token || this.connected) {
      return
    }

    // Отримуємо правильний Socket.io URL
    const socketUrl = this.getSocketUrl()

    console.log('🔌 Connecting to Socket.io:', socketUrl)

    this.socket = io(socketUrl, {
      auth: {
        token: authStore.token,
      },
      // Використовуємо обидва транспорти для надійності
      transports: ['websocket', 'polling'],
      // Додаткові налаштування для стабільності
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: this.maxReconnectAttempts,
    })

    this.setupEventHandlers()
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('✅ Socket.io connected successfully')
      this.connected = true
      this.reconnectAttempts = 0

      // Запитуємо непрочитані сповіщення при підключенні
      this.socket.emit('get_unread_notifications')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected:', reason)
      this.connected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('🚫 Socket.io connection error:', error)
      this.connected = false

      // Автореконнект з обмеженням спроб
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)

        setTimeout(() => {
          if (!this.connected) {
            this.connect()
          }
        }, 2000 * this.reconnectAttempts)
      } else {
        console.warn('🛑 Max reconnection attempts reached. Socket.io disabled.')
      }
    })

    // Налаштування обробників подій
    this.setupNotificationHandlers()
    this.setupChatHandlers()
  }

  setupNotificationHandlers() {
    // Нове сповіщення
    this.socket.on('new_notification', (data) => {
      console.log('🔔 New notification received:', data)

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
      console.log('💬 New chat message received:', data)

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

  // Перевірка стану підключення
  isConnected() {
    return this.connected && this.socket && this.socket.connected
  }

  // Ручне переключення (для дебагу)
  reconnect() {
    this.disconnect()
    setTimeout(() => {
      this.reconnectAttempts = 0
      this.connect()
    }, 1000)
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting Socket.io...')
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }
}

// Експортуємо singleton
export default new SocketService()

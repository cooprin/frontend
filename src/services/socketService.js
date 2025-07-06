import { io } from 'socket.io-client'
import { useAuthStore } from 'src/stores/auth'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.eventListeners = new Map() // Для зберігання підписок компонентів
  }

  /**
   * Універсальне визначення Socket.io URL на основі поточного домену
   */
  getSocketUrl() {
    const currentHost = window.location.hostname
    const currentProtocol = window.location.protocol === 'https:' ? 'https' : 'http'

    if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
      return 'http://localhost:3000'
    } else if (currentHost.includes('test-erp.cooprin.com.ua')) {
      return 'https://test-erp.cooprin.com.ua'
    } else if (currentHost.includes('erp.cooprin.com.ua')) {
      return 'https://erp.cooprin.com.ua'
    } else {
      return `${currentProtocol}://${currentHost}`
    }
  }

  connect() {
    const authStore = useAuthStore()

    if (!authStore.token || this.connected) {
      return
    }

    const socketUrl = this.getSocketUrl()
    console.log('🔌 Connecting to Socket.io:', socketUrl)

    this.socket = io(socketUrl, {
      auth: {
        token: authStore.token,
      },
      transports: ['websocket', 'polling'],
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
      this.socket.emit('get_unread_notifications')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected:', reason)
      this.connected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('🚫 Socket.io connection error:', error)
      this.connected = false

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

    this.setupNotificationHandlers()
    this.setupChatHandlers()
    this.setupTicketHandlers()
    this.setupObjectHandlers()
  }

  setupNotificationHandlers() {
    this.socket.on('new_notification', (data) => {
      console.log('🔔 New notification received:', data)
      this.emitToListeners('notification:new', data)
    })

    this.socket.on('unread_count_updated', (data) => {
      this.emitToListeners('notification:unread_count_updated', data)
    })

    this.socket.on('notification_read', (data) => {
      this.emitToListeners('notification:read', data)
    })

    this.socket.on('notifications_all_read', (data) => {
      this.emitToListeners('notification:all_read', data)
    })

    this.socket.on('unread_notifications_count', (data) => {
      this.emitToListeners('notification:unread_count', data)
    })
  }

  setupChatHandlers() {
    this.socket.on('new_message', (data) => {
      console.log('💬 New chat message received:', data)
      this.emitToListeners('chat:new_message', data)
    })

    this.socket.on('user_joined_room', (data) => {
      this.emitToListeners('chat:user_joined', data)
    })

    this.socket.on('user_left_room', (data) => {
      this.emitToListeners('chat:user_left', data)
    })

    this.socket.on('user_typing', (data) => {
      this.emitToListeners('chat:user_typing', data)
    })

    this.socket.on('user_stopped_typing', (data) => {
      this.emitToListeners('chat:user_stopped_typing', data)
    })

    this.socket.on('chat_assigned', (data) => {
      this.emitToListeners('chat:assigned', data)
    })
  }

  setupTicketHandlers() {
    // Нові обробники для заявок
    this.socket.on('ticket_comment_added', (data) => {
      console.log('📝 New ticket comment:', data)
      this.emitToListeners('ticket:comment_added', data)
    })

    this.socket.on('ticket_updated', (data) => {
      console.log('🎫 Ticket updated:', data)
      this.emitToListeners('ticket:updated', data)
    })

    this.socket.on('ticket_assigned', (data) => {
      this.emitToListeners('ticket:assigned', data)
    })
  }

  setupObjectHandlers() {
    // Обробник для real-time оновлень об'єктів
    this.socket.on('objects_realtime_updated', (data) => {
      console.log('🚗 Objects real-time data updated:', data)
      this.emitToListeners('objects:realtime_updated', data)
    })

    // Обробник для зміни статусу об'єкта
    this.socket.on('object_status_changed', (data) => {
      console.log('🔄 Object status changed:', data)
      this.emitToListeners('objects:status_changed', data)
    })
  }

  // Методи для підписки компонентів на події
  subscribe(eventName, callback, componentId = null) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Map())
    }

    const listenerId = componentId || Date.now() + Math.random()
    this.eventListeners.get(eventName).set(listenerId, callback)

    return listenerId // Повертаємо ID для відписки
  }

  unsubscribe(eventName, listenerId) {
    if (this.eventListeners.has(eventName)) {
      this.eventListeners.get(eventName).delete(listenerId)
    }
  }

  unsubscribeAll(componentId) {
    // Відписати компонент від всіх подій
    this.eventListeners.forEach((listeners) => {
      listeners.delete(componentId)
    })
  }

  emitToListeners(eventName, data) {
    if (this.eventListeners.has(eventName)) {
      this.eventListeners.get(eventName).forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error)
        }
      })
    }
  }

  // Методи для відправки подій на сервер
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

  // Нові методи для заявок
  subscribeToTicket(ticketId) {
    if (this.socket && this.connected) {
      this.socket.emit('join_ticket_room', ticketId)
    }
  }

  unsubscribeFromTicket(ticketId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave_ticket_room', ticketId)
    }
  }

  // Перевірка стану підключення
  isConnected() {
    return this.connected && this.socket && this.socket.connected
  }

  // Ручне переключення
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
      this.eventListeners.clear()
    }
  }

  requestObjectsUpdate() {
    if (this.socket && this.connected) {
      this.socket.emit('request_objects_update')
    }
  }
}

// Експортуємо singleton
export default new SocketService()

# WebSockets Module Documentation

## Overview

The WebSockets module provides real-time, bidirectional communication between the server and connected clients using Socket.IO. It enables push notifications, live updates, and real-time event broadcasting across the healthcare system without requiring clients to poll the server. The implementation uses a custom Node.js-based WebSocket server that listens for Redis-published events and broadcasts them to authenticated clients.

## Module Structure

```
websockets/
├── SocketClient.js           # Socket.IO client initialization
├── ClientSubscriber.js       # Notification listener and handler
├── index.js                  # Module entry point
├── config.json               # Environment-specific configuration
└── notification.md           # Notification documentation
```

## Key Features

### 1. Real-Time Notifications
- Push notifications to connected clients
- User-specific notification channels
- Real-time badge counter updates
- Non-blocking asynchronous delivery

### 2. Authenticated WebSocket Connections
- Token-based authentication
- Secure WebSocket connections
- Automatic token validation
- Connection state management

### 3. Channel Subscription
- Dynamic channel subscription
- User-specific channels
- Role-based channels
- Custom channel patterns

### 4. Event Broadcasting
- Server-side event publishing via Redis
- Real-time client notifications
- Event type classification
- Timestamp tracking

### 5. Automatic Reconnection
- Automatic reconnection on disconnect
- Configurable retry intervals (3-second backoff)
- Maximum retry limits (5 attempts)
- Health check polling

### 6. Multi-Environment Support
- Development configuration (port 3000)
- Production configuration (port 6023)
- Automatic environment detection
- Host URL parsing

## Core Classes

### SocketClient.js

Main WebSocket client for Socket.IO communication.

**Constructor**:
```javascript
constructor() {
    // Determines host URL from current location
    // Initializes Socket.IO connection
    // Sets up reconnection mechanism
}
```

**Key Properties**:
```javascript
socket              // Socket.IO instance
hostInUse          // The WebSocket server URL
reconnectCount     // Number of reconnection attempts
intervalID         // Reconnection interval reference
```

**Key Methods**:

#### `initiateIoConnection()`
Establishes WebSocket connection with authentication.

```javascript
initiateIoConnection() {
    // Only connects if user is authenticated (immigrant token exists)
    // Uses WebSocket transport only
    // Includes authentication token in connection
    // Configuration:
    // - transports: ['websocket']
    // - forceNew: true
    // - withCredentials: true
    // - auth: { token: user_access_token }
}
```

**Returns**: Socket.IO socket instance or null if not authenticated

#### `connectTo(channel, callBackAction)`
Subscribes to a notification channel and sets up listeners.

**Parameters**:
- `channel` (string) - Channel name to subscribe to
- `callBackAction` (function) - Callback function when events are received

**Functionality**:
```javascript
connectTo(channel, callBackAction) {
    // 1. Gets user identifier from DOM element (#uidentifier)
    // 2. On socket connect:
    //    - Emits 'subscribe' event with channel and user ID
    // 3. Listens for disconnect events
    //    - Initiates automatic reconnection
    // 4. Listens for error events
    //    - Logs errors
    // 5. Listens for channel events
    //    - Executes callback with received data
}
```

#### `tryReconnect()`
Attempts to reconnect to WebSocket server.

**Reconnection Logic**:
```javascript
tryReconnect() {
    // 1. Increments reconnectCount
    // 2. Makes HTTP GET request to root path
    // 3. If successful, attempts Socket.IO reconnect
    // 4. Stops retrying after 5 attempts
    // 5. 3-second backoff between attempts
}
```

### ClientSubscriber.js

Handles notification subscription and processing.

**Constructor**:
```javascript
constructor() {
    // Creates SocketClient instance
    // Prepares notification listener
}
```

**Key Methods**:

#### `init()`
Initializes notification subscription.

```javascript
init() {
    // 1. Extracts facility subdomain from URL
    // 2. Creates channel name: "[subdomain]-notification"
    // 3. Calls socketIoClient.connectTo()
    // 4. Sets up listener for notification events
}
```

**Example Channel Names**:
- `kisii-notification` (Kisii Health Facility)
- `nairobi-notification` (Nairobi Health Facility)
- `mombasa-notification` (Mombasa Health Facility)

#### `listenForResultsPosted(data)`
Processes incoming notifications and updates UI.

**Event Data Structure**:
```javascript
{
    message: {
        title: string,      // Notification title
        message: string,    // Notification body
        link: string,       // Click action URL
        type: string,       // Notification type (e.g., 'lab-result', 'payment')
        period: string      // Time/period of event
    }
}
```

**UI Updates**:
1. Inserts notification HTML into `#user-notifications-list` element
2. Updates notification counter badge (`#notifications-counter`)
3. Adds CSS class for styling
4. Makes notification clickable (navigates to link)

**Notification HTML Structure**:
```html
<div class="user-notification">
    <a href="{link}">
        <div>
            <div style="font-size: 14px; font-weight: bold">{title}</div>
            <div>{message}</div>
            <div style="font-size: 11px; display: flex; font-style: italic; justify-content: space-between; width: 300px">
                <div>{period}</div>
                <div style="padding-right: 20px">{type}</div>
            </div>
        </div>
    </a>
</div>
```

## Configuration

### config.json

WebSocket server configuration by environment.

```json
{
  "prod": {
    "port": "6023"           // Production WebSocket server port
  },
  "dev": {
    "port": "3000"           // Development WebSocket server port
  }
}
```

**Host Resolution Logic**:
- Extracts domain from current URL
- If subdomain present: uses domain without subdomain + port
- If no subdomain: uses domain + port

**Examples**:
```
URL: https://kisii.hospital.com
Host: //hospital.com:6023

URL: https://localhost:8000
Host: //localhost:3000 (dev)
```

## Module Integration

### Entry Point (index.js)

Automatically initializes WebSocket listener on page load.

```javascript
window.addEventListener('load', function() {
    const clientSubscriber = new ClientSubscriber();
    clientSubscriber.init();
});
```

**Initialization Sequence**:
1. Page loads completely (all resources loaded)
2. ClientSubscriber instance created
3. Socket.IO connection initiated
4. Channel subscription established
5. Listener ready for notifications

## Event Broadcasting

### Server-Side Event Creation

Use `Ignite\Core\Events\SendoutNotification` event.

**Event Constructor Parameters**:
```php
new SendoutNotification(
    $user_id,        // Recipient user ID
    $type,           // Notification type (string)
    $title,          // Notification title
    $message,        // Notification body
    $link            // Action URL when clicked
);
```

**Example Usage**:
```php
// Lab result notification
event(new SendoutNotification(
    $patient_id,
    'lab-result',
    'Lab Results Available',
    'Your blood test results are ready',
    '/evaluation/consultations/'.$consultation_id.'/lab-results'
));

// Payment confirmation
event(new SendoutNotification(
    $patient_id,
    'payment',
    'Payment Confirmed',
    'Your payment of Ksh. 5,000 has been received',
    '/finance/invoices/'.$invoice_id
));

// Admission notification
event(new SendoutNotification(
    $patient_id,
    'admission',
    'Admission Approved',
    'Your hospital admission has been approved',
    '/inpatient/admissions/'.$admission_id
));
```

### Event Flow

```
Laravel Backend
    ↓
SendoutNotification Event Fired
    ↓
Event Handler publishes to Redis
    ↓
Node.js WebSocket Server
    (listening on Redis events)
    ↓
Server identifies target user
    ↓
Server finds connected clients in channel
    ↓
Broadcasts notification to clients
    ↓
ClientSubscriber.listenForResultsPosted()
    ↓
UI Updated with Notification
```

## Notification Types

### Common Notification Types

**Clinical**:
- `lab-result` - Laboratory test results available
- `imaging-result` - Imaging/radiology results
- `consultation` - Consultation scheduled or completed
- `prescription` - Prescription ready for pickup
- `admission` - Admission approved/processed
- `discharge` - Discharge summary available

**Financial**:
- `payment` - Payment received/confirmed
- `invoice` - Invoice generated
- `insurance-approval` - Insurance approval received
- `exemption` - Exemption granted
- `credit-note` - Credit note issued

**Operational**:
- `queue` - Patient queue update
- `appointment` - Appointment reminder/confirmation
- `stock-alert` - Low stock alert
- `maintenance` - System maintenance notice
- `alert` - General system alert

## Common Workflows

### 1. Setting Up Notifications

```
1. Page loads in user browser
2. index.js automatically initializes
3. ClientSubscriber instance created
4. Socket.IO connection established with auth token
5. Channel subscription sent to server
6. Server confirms subscription
7. Client awaits notifications
```

### 2. Broadcasting Lab Result

```
1. Lab technician inputs test results
2. Result is saved in database
3. SendoutNotification event fired
4. Event handler publishes to Redis
5. WebSocket server receives event
6. Identifies target patient user
7. Broadcasts to patient's connected clients
8. ClientSubscriber.listenForResultsPosted() executes
9. Notification appears in patient's UI
10. Notification counter increments
11. Patient can click to view results
```

### 3. Handling Disconnection

```
1. Network interrupted or server down
2. Socket.IO disconnect event fires
3. SocketClient.tryReconnect() initiated
4. Every 3 seconds: HTTP GET to root
5. Server responds when back online
6. Socket.IO reconnects automatically
7. Channel re-subscribed
8. Client ready for new notifications
```

### 4. Displaying Notification

```
1. Notification received via socket event
2. HTML generated with notification data
3. Inserted at top of notifications list
4. Badge counter incremented
5. CSS styling applied
6. User can click to navigate to resource
```

## Integration Points

- **Evaluation Module**: Lab result notifications, consultation updates
- **Finance Module**: Payment confirmations, invoice updates
- **Reception Module**: Queue updates, appointment reminders
- **Inpatient Module**: Admission notifications, discharge updates
- **Inventory Module**: Stock alerts, low inventory warnings
- **Theatre Module**: Surgery schedule updates, procedure notifications
- **All Modules**: System alerts and operational notifications

## UI Integration

### Required HTML Elements

For notifications to display, ensure these elements exist:

```html
<!-- Notification list container -->
<div id="user-notifications-list"></div>

<!-- Notification counter badge -->
<span id="notifications-counter">0</span>

<!-- User identifier for channel subscription -->
<div id="uidentifier" style="display:none;">{user-id}</div>
```

### CSS Styling

```css
.user-notification {
    padding: 10px;
    border-bottom: 1px solid #ddd;
    cursor: pointer;
}

.user-notification a {
    text-decoration: none;
    color: inherit;
}

.user-notification:hover {
    background-color: #f5f5f5;
}

.badge-num {
    background-color: #f44336;
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 12px;
    font-weight: bold;
}
```

## Best Practices

### 1. Event Creation

- Always include relevant `link` for user navigation
- Use consistent notification `type` values
- Include timestamp in `period` field
- Keep `title` concise and descriptive
- Make `message` user-friendly and informative

### 2. Connection Management

- Check user authentication before WebSocket init
- Validate user permissions in event handler
- Handle connection failures gracefully
- Log connection errors for debugging
- Monitor reconnection attempts

### 3. Performance

- Limit notification frequency to prevent spam
- Batch related notifications when possible
- Clean up old notifications periodically
- Optimize notification HTML rendering
- Use efficient jQuery/DOM selectors

### 4. Security

- Always validate authentication token
- Verify user authorization before sending notification
- Sanitize notification content (XSS prevention)
- Use HTTPS/WSS in production
- Validate Redis connection security

### 5. User Experience

- Show visual notification indicators
- Include actionable links in notifications
- Provide notification history/archive
- Allow notification preferences
- Clear notifications appropriately

## Troubleshooting

### Notifications Not Appearing

**Check List**:
1. Verify `#user-notifications-list` element exists
2. Check `#uidentifier` element has correct user ID
3. Verify user is authenticated (immigrant token present)
4. Check WebSocket server is running
5. Verify Redis is running and listening
6. Check browser console for JavaScript errors
7. Verify firewall allows WebSocket connections

**Debug Steps**:
```javascript
// Check WebSocket connection
console.log(window.socketClient.socket.connected);

// Check current channel
console.log(window.socketClient.socket.id);

// Monitor incoming events
window.socketClient.socket.on('*', (event, data) => {
    console.log('Event received:', event, data);
});
```

### Connection Keeps Dropping

**Check List**:
1. Verify WebSocket server port is accessible
2. Check network for frequent interruptions
3. Review WebSocket server logs
4. Check Redis connectivity
5. Verify token expiration settings
6. Monitor server resource usage

**Configuration Check**:
```json
// Verify config.json ports match server
{
  "prod": {
    "port": "6023"   // Must match server listening port
  },
  "dev": {
    "port": "3000"
  }
}
```

### High Notification Latency

**Optimization Steps**:
1. Check Redis queue length
2. Monitor WebSocket server CPU/memory
3. Reduce notification frequency
4. Batch notifications where possible
5. Optimize HTML generation in listener
6. Check network latency

### Memory Leaks

**Prevention**:
1. Clear old notifications periodically
2. Remove DOM elements for deleted items
3. Clean up event listeners
4. Close unused socket connections
5. Monitor browser memory usage

```javascript
// Clear old notifications
function clearOldNotifications(maxAge = 3600000) {
    const now = Date.now();
    const notifications = document.querySelectorAll('.user-notification');
    
    notifications.forEach(notif => {
        const age = now - parseInt(notif.dataset.timestamp || 0);
        if (age > maxAge) {
            notif.remove();
        }
    });
}

// Call periodically
setInterval(clearOldNotifications, 300000); // Every 5 minutes
```

## Future Enhancements

### TODO Items (from notification.md)

1. **Delete Redundant Classes**
   - `Ignite\Core\Repositories\CacheNotificationDecorator`
   - `Ignite\Core\Repositories\NotificationRepository`

2. **Improve User Experience**
   - Fix WebSocket event triggering (first click required)
   - Open modals automatically for WebSocket updates
   - Enable WebSocket-triggered page refreshes

3. **Expand Notifications**
   - Plug in purchase order notifications
   - Add inventory alerts
   - Add staff schedules notifications
   - Add system maintenance alerts

4. **Enhanced Features**
   - Notification persistence (database storage)
   - Notification preferences per user
   - Notification categories/filtering
   - Notification templates
   - Multi-language support

## API Reference

### Server-Side Event (Laravel)

```php
// Location: Ignite\Core\Events\SendoutNotification

class SendoutNotification implements ShouldBroadcast {
    public $user_id;        // Target user ID
    public $type;           // Notification type
    public $title;          // Notification title
    public $message;        // Notification message
    public $link;           // Action URL
    
    public function __construct($user_id, $type, $title, $message, $link) {
        $this->user_id = $user_id;
        $this->type = $type;
        $this->title = $title;
        $this->message = $message;
        $this->link = $link;
    }
}
```

### Client-Side Socket Events

**Emitted Events**:
```javascript
// Subscribe to channel
socket.emit('subscribe', {
    channel: string,        // Channel name
    customId: string        // User ID
});
```

**Listened Events**:
```javascript
// Notification received on channel
socket.on(channel, (data) => {
    // data.message contains notification
});

// Connection established
socket.on('connect', () => {
    // Subscribe to channel
});

// Connection lost
socket.on('disconnect', () => {
    // Attempt reconnection
});

// Error occurred
socket.on('error', (error) => {
    // Handle error
});
```

## Performance Metrics

### Expected Metrics

- **Connection Time**: < 500ms
- **Notification Latency**: < 1 second
- **Reconnection Time**: < 10 seconds
- **Memory per Connection**: ~5MB
- **Message Throughput**: 1000+ notifications/second

### Monitoring

```javascript
// Track notification arrival time
const notifStart = Date.now();

socket.on('channel', (data) => {
    const latency = Date.now() - notifStart;
    console.log('Notification latency:', latency, 'ms');
});
```

---

**Last Updated**: December 2025  
**Version**: 1.0.0


## Introduction
Breaking this down the notification are purely a custom implementation and in this case we will not be 
using pusher or laravel echo in no place.

Instead, we have our own sort of pusher implementation that doesn't not rely on pusher infrastructure but rather 
one that is created using nodejs.<br/>
To get you upto speed, let me give you an overview of what exactly happens: 

> One we have server that is listening for any redis published events and notifies the listening clients
> it is fully authenticated and thus requires that the listeners provide a valid access token where upon 
> the receipt of these events, they are sent over to the required if listening.

Alright that shouldn't worry you much but rather how you will actually be posting the events and how the server
will know which channels to subscribe to:


###### Event creation
There is already the `Ignite\Core\Events\SendoutNotification` event, and this is where the magic begins from: 
in its constructor you are meant to supply: 
```
$user_id, $type, $title, $message, $link
```
* `user_id`  to Which user exactly are you sending this notification to
* `type` the type of notification you are sending out
* `title` The title of the nofitication
* `message` The body of the notification
* `link` the url link to which when the notification is clicked opens up to



##### TODO:
Delete the now redundant notification classes:
* `Ignite\Core\Repositories\CacheNotificationDecorator`
* `Ignite\Core\Repositories\NotificationRepository` - interface


* Fix the need to always first click the notification menu for websocket events to update
* Opening modals when the update is from websockets
* Plug in purchase order notifications etc

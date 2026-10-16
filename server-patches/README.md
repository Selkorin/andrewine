# Server patches

These files mirror the paths in the deployed admin-panel and backend projects.

## Telegram manager group

Add the bot to the private group, allow it to post messages, then configure the
backend process with:

```dotenv
MANAGER_GROUP_CHAT_ID=-1003946140566
ADMIN_PANEL_URL=https://admin.example.ru
UPLOAD_ROOT=/absolute/path/to/backend/storage
```

`MANAGER_GROUP_CHAT_ID` is optional. When it is absent, the backend keeps the
existing direct-manager notification behavior and skips the group message.
The bot token continues to come from the backend's existing `BOT_TOKEN`
setting; do not commit it to this repository.

`UPLOAD_ROOT` is required when the database stores relative image paths. It
must point to the directory from which those paths can be resolved. The bot
sends the full application as a message and replies to it with an album of up
to 10 user photos.

To determine the private group's numeric id, add the bot to the group, send one
message there, and inspect the Bot API `getUpdates` response. Telegram
supergroup ids normally begin with `-100`.

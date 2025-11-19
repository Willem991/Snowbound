# chat/consumers.py
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

# Store all penguins globally per room (simple version)
penguins_in_room = {}

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = "chat_game"
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
        self.accept()

        # Send current penguins to the new client
        self.send(text_data=json.dumps({
            "type": "all_penguins",
            "penguins": penguins_in_room
        }))

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )
        # Optionally, you could clean up here if you track client -> penguin mapping

    def receive(self, text_data):
        data = json.loads(text_data)
        peng_id = str(data.get("id"))

        if data.get("type") == "remove":
            # Remove penguin from server state
            if peng_id in penguins_in_room:
                del penguins_in_room[peng_id]
                # Broadcast removal to all clients
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {"type": "chat.remove", "id": peng_id}
                )
            return

        # Normal position update
        x = data["x"]
        y = data["y"]
        penguins_in_room[peng_id] = {"x": x, "y": y}

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {"type": "chat.message", "id": peng_id, "x": x, "y": y}
        )

    # Broadcast updates
    def chat_message(self, event):
        self.send(text_data=json.dumps({
            "id": event["id"],
            "x": event["x"],
            "y": event["y"]
        }))

    # Broadcast removal
    def chat_remove(self, event):
        self.send(text_data=json.dumps({
            "type": "remove",
            "id": event["id"]
        }))

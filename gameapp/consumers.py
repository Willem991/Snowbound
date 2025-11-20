# chat/consumers.py
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

# Store penguins per room
penguins_in_room = {}  # {room_name: {penguin_id: {"x": x, "y": y}}}

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"game_{self.room_name}"
        
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
        self.accept()

        # Ensure room exists
        if self.room_name not in penguins_in_room:
            penguins_in_room[self.room_name] = {}

        # Send current penguins **for this room only**
        self.send(text_data=json.dumps({
            "type": "all_penguins",
            "penguins": penguins_in_room[self.room_name]
        }))

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    def receive(self, text_data):
        data = json.loads(text_data)
        peng_id = str(data.get("id"))

        if data.get("type") == "remove":
            # Remove penguin from this room
            if peng_id in penguins_in_room[self.room_name]:
                del penguins_in_room[self.room_name][peng_id]
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {"type": "chat.remove", "id": peng_id}
                )
            return

        # Normal position update
        x = data["x"]
        y = data["y"]
        penguins_in_room[self.room_name][peng_id] = {"x": x, "y": y}

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {"type": "chat.message", "id": peng_id, "x": x, "y": y}
        )

    def chat_message(self, event):
        self.send(text_data=json.dumps({
            "id": event["id"],
            "x": event["x"],
            "y": event["y"]
        }))

    def chat_remove(self, event):
        self.send(text_data=json.dumps({
            "type": "remove",
            "id": event["id"]
        }))

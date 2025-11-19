# chat/consumers.py
import json

from channels.generic.websocket import WebsocketConsumer


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        x = text_data_json["x"]
        y = text_data_json["y"]

        self.send(text_data=json.dumps({
            "x":x,
            "y":y
            }))
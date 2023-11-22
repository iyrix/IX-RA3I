# boards/views/trello_card_views.py
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from board.models import Card
from board.serializers import CardSerializer

class TrelloCardView(APIView):

    def get(self, request, board_id, format=None):
        try:
            cards = Card.objects.filter(list__board__id=board_id)
        except Card.DoesNotExist:
            raise Http404

        serializer = CardSerializer(cards, many=True)
        return Response(serializer.data)

    def post(self, request, board_id, format=None):
        request.data['list__board'] = board_id
        serializer = CardSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_card(self, request, board_id, card_id, format=None):
        try:
            card = Card.objects.get(pk=card_id, list__board__id=board_id)
        except Card.DoesNotExist:
            raise Http404

        serializer = CardSerializer(card)
        return Response(serializer.data)

    def put(self, request, board_id, card_id, format=None):
        try:
            card = Card.objects.get(pk=card_id, columnId__board__id=board_id)
        except Card.DoesNotExist:
            raise Http404

        serializer = CardSerializer(card, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, board_id, card_id, format=None):
        try:
            card = Card.objects.get(pk=card_id, columnId__board__id=board_id)
        except Card.DoesNotExist:
            raise Http404

        card.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


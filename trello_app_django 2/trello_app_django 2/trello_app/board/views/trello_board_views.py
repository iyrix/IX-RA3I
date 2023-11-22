from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from board.models import Board, List  # Import List model
from board.serializers import TrelloBoardSerializer, ListSerializer  # Import ListSerializer
from rest_framework.decorators import action

class TrelloBoard(APIView):

    def get(self, request, board_id, format=None):  # Accept board_id as a parameter
        try:
            board = Board.objects.get(pk=board_id)
        except Board.DoesNotExist:
            raise Http404

        serializer_board = TrelloBoardSerializer(board)

        data = {
            'board': serializer_board.data,
        }

        return Response(data)

    def post(self, request, format=None):
        serializer = TrelloBoardSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, board_id, format=None):  # Add method to update board details
        try:
            board = Board.objects.get(pk=board_id)
        except Board.DoesNotExist:
            raise Http404

        serializer = TrelloBoardSerializer(board, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, board_id, format=None):  # Add method to delete a board
        try:
            board = Board.objects.get(pk=board_id)
        except Board.DoesNotExist:
            raise Http404

        board.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



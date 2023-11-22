# boards/views/trello_list_views.py
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from board.models import List
from board.serializers import ListSerializer

class TrelloListView(APIView):

    def get(self, request, board_id, list_id=None, format=None):
        if list_id is not None:
            try:
                specific_list = List.objects.get(pk=list_id, board__id=board_id)
            except List.DoesNotExist:
                raise Http404

            serializer_list = ListSerializer(specific_list)
            return Response(serializer_list.data)

        else:
            try:
                lists = List.objects.filter(board__id=board_id)
            except List.DoesNotExist:
                raise Http404

            serializer_list = ListSerializer(lists, many=True)

            data = {
                'lists': serializer_list.data,
            }

            return Response(data)

    def post(self, request, board_id, format=None):
        # Ensure you include the board_id when creating a new list
        request.data['board'] = 1

        serializer = ListSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, board_id, list_id, format=None):
        try:
            specific_list = List.objects.get(pk=list_id, board__id=board_id)
        except List.DoesNotExist:
            raise Http404

        serializer = ListSerializer(specific_list, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, board_id, list_id, format=None):
        try:
            specific_list = List.objects.get(pk=list_id, board__id=board_id)
        except List.DoesNotExist:
            raise Http404

        specific_list.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # Additional methods for updating and deleting lists as needed...


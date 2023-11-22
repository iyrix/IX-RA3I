from django.urls import path
from .views.trello_board_views import TrelloBoard
from .views.trello_list_views import TrelloListView
from .views.trello_card_views import TrelloCardView

urlpatterns = [
    path('boards/<int:board_id>/', TrelloBoard.as_view(), name='get_board'),
    path('boards/', TrelloBoard.as_view(), name='create_board'),
    path('boards/<int:board_id>/lists/', TrelloListView.as_view(), name='get_lists'),
    path('boards/<int:board_id>/lists/<int:list_id>/', TrelloListView.as_view(), name='get_specific_list'),
    path('boards/<int:board_id>/lists/<int:list_id>/delete/', TrelloListView.as_view(), name='delete_list'),
    path('boards/<int:board_id>/cards/<int:card_id>/delete/', TrelloCardView.as_view(), name='delete_card'),
    path('boards/<int:board_id>/cards/<int:card_id>/', TrelloCardView.as_view(), name='get_card'),
    path('boards/<int:board_id>/cards/', TrelloCardView.as_view(), name='get_cards'),
    path('boards/<int:board_id>/cards/<int:card_id>/', TrelloCardView.as_view(), name='card_detail'),
    path('boards/<int:board_id>/cards/', TrelloCardView.as_view(), name='create_card'),
    path('boards/<int:board_id>/lists/', TrelloListView.as_view(), name='create_list')
    # path('board/<int:board_id>/lists/', TrelloBoard.as_view(), name='dele')
    # Other URL patterns...
]

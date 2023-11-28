from django.db import models


class Board(models.Model):
    board_name = models.CharField(max_length=100)

class List(models.Model):
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField()  # Add the order attribute
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='lists')
    # Other fields for your List model

    class Meta:
        ordering = ['order']  # Order lists by the 'order' attribute

class Card(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    order = models.IntegerField()
    columnId = models.ForeignKey(List, on_delete=models.CASCADE, related_name='cards')
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='cards')